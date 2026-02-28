import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events, rsvps, notifications, users } from '../db/schema.js';

export const getAllEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const allEvents = await db.select().from(events).orderBy(events.date);
        const userRsvps = await db.select().from(rsvps).where(eq(rsvps.studentId, userId));
        const rsvpEventIds = new Set(userRsvps.map(r => r.eventId));

        const eventsWithRsvpStatus = allEvents.map(event => ({
            ...event,
            isRsvpd: rsvpEventIds.has(event.id)
        }));
        res.json(eventsWithRsvpStatus);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

export const createEvent = async (req, res) => {
    try {
        const { title, description, date, category, venue } = req.body;
        const adminId = req.user.id;

        const newEvent = await db.insert(events).values({
            title,
            description: description || '',
            date: new Date(date),
            category: category || 'academic',
            venue: venue || '',
            createdBy: adminId
        }).returning();

        // Notify all students
        const allStudents = await db.select({ id: users.id }).from(users).where(eq(users.role, 'student'));
        if (allStudents.length > 0) {
            const notifRows = allStudents.map(s => ({
                userId: s.id,
                message: `🎉 New event: "${title}" on ${new Date(date).toLocaleDateString()}`,
                type: 'info'
            }));
            await db.insert(notifications).values(notifRows);
        }

        res.status(201).json(newEvent[0]);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        await db.delete(rsvps).where(eq(rsvps.eventId, eventId));
        await db.delete(events).where(eq(events.id, eventId));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

export const toggleRsvp = async (req, res) => {
    try {
        const studentId = req.user.id;
        const eventId = parseInt(req.params.id);

        const existingRsvp = await db.select().from(rsvps)
            .where(and(eq(rsvps.studentId, studentId), eq(rsvps.eventId, eventId)));

        if (existingRsvp.length > 0) {
            await db.delete(rsvps).where(eq(rsvps.id, existingRsvp[0].id));
            res.json({ message: 'RSVP removed', eventId, status: 'removed' });
        } else {
            await db.insert(rsvps).values({ studentId, eventId });
            res.json({ message: 'RSVP created', eventId, status: 'added' });
        }
    } catch (error) {
        console.error('Error toggling RSVP:', error);
        res.status(500).json({ error: 'Failed to toggle RSVP' });
    }
};
