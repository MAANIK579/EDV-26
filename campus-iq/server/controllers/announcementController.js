import { db } from '../db/index.js';
import { announcements, notifications, users } from '../db/schema.js';
import { eq, desc, ne } from 'drizzle-orm';

// GET /api/announcements — all announcements (for students + admins)
export const getAnnouncements = async (req, res) => {
    try {
        const result = await db.select({
            id: announcements.id,
            title: announcements.title,
            text: announcements.text,
            priority: announcements.priority,
            createdAt: announcements.createdAt,
            createdBy: announcements.createdBy
        }).from(announcements).orderBy(desc(announcements.createdAt));

        res.json(result);
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
};

// POST /api/announcements — admin-only: create + notify all students
export const createAnnouncement = async (req, res) => {
    try {
        const { title, text, priority } = req.body;
        const adminId = req.user.id;

        // Insert announcement
        const newAnn = await db.insert(announcements).values({
            title,
            text: text || '',
            priority: priority || 'normal',
            createdBy: adminId
        }).returning();

        // Notify all students
        const allStudents = await db.select({ id: users.id }).from(users).where(eq(users.role, 'student'));

        if (allStudents.length > 0) {
            const notifRows = allStudents.map(s => ({
                userId: s.id,
                message: `📢 New announcement: "${title}"`,
                type: priority === 'urgent' ? 'urgent' : 'info'
            }));
            await db.insert(notifications).values(notifRows);
        }

        res.status(201).json(newAnn[0]);
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
};

// DELETE /api/announcements/:id — admin-only
export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await db.delete(announcements).where(eq(announcements.id, parseInt(id)));
        res.json({ success: true });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
};
