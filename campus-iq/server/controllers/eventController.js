import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { events, rsvps, notifications, users } from '../db/schema.js';

// Get all events with user's RSVP status
export const getAllEvents = (req, res) => {
    try {
        const userId = req.user.id;

        const allEvents = db.select().from(events).orderBy(events.date).all();

        // Fetch user's RSVPs
        const userRsvps = db.select().from(rsvps).where(eq(rsvps.studentId, userId)).all();
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

// POST /api/events — admin creates event + notifies students
export const createEvent = (req, res) => {
    try {
        const { title, description, date, category, venue } = req.body;
        const adminId = req.user.id;

        const newEvent = db.insert(events).values({
            title,
            description: description || '',
            date: new Date(date).toISOString(),
            category: category || 'academic',
            venue: venue || '',
            createdBy: adminId
        }).returning().all();

        // Notify all students
        const allStudents = db.select({ id: users.id }).from(users).where(eq(users.role, 'student')).all();
        if (allStudents.length > 0) {
            for (const s of allStudents) {
                db.insert(notifications).values({
                    userId: s.id,
                    message: `🎉 New event: "${title}" on ${new Date(date).toLocaleDateString()}`,
                    type: 'info'
                }).run();
            }
        }

        res.status(201).json(newEvent[0]);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

// DELETE /api/events/:id — admin deletes event
export const deleteEvent = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        // Delete RSVPs for this event first
        db.delete(rsvps).where(eq(rsvps.eventId, eventId)).run();
        db.delete(events).where(eq(events.id, eventId)).run();
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

// Toggle RSVP for an event
export const toggleRsvp = (req, res) => {
    try {
        const studentId = req.user.id;
        const eventId = parseInt(req.params.id);

        const existingRsvp = db.select().from(rsvps)
            .where(and(eq(rsvps.studentId, studentId), eq(rsvps.eventId, eventId))).all();

        if (existingRsvp.length > 0) {
            db.delete(rsvps).where(eq(rsvps.id, existingRsvp[0].id)).run();
            res.json({ message: 'RSVP removed', eventId, status: 'removed' });
        } else {
            db.insert(rsvps).values({ studentId, eventId }).run();
            res.json({ message: 'RSVP created', eventId, status: 'added' });
        }
    } catch (error) {
        console.error('Error toggling RSVP:', error);
        res.status(500).json({ error: 'Failed to toggle RSVP' });
    }
};
