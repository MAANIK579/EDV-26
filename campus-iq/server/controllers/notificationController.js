import { db } from '../db/index.js';
import { notifications } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/notifications — notifications for logged-in user
export const getNotifications = (req, res) => {
    try {
        const userId = req.user.id;
        const result = db.select().from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .all();

        res.json(result);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// PATCH /api/notifications/:id/read — mark one as read
export const markNotificationRead = (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        db.update(notifications)
            .set({ read: true })
            .where(and(eq(notifications.id, parseInt(id)), eq(notifications.userId, userId)))
            .run();

        res.json({ success: true });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Failed to mark notification read' });
    }
};

// PATCH /api/notifications/read-all — mark all as read
export const markAllRead = (req, res) => {
    try {
        const userId = req.user.id;
        db.update(notifications)
            .set({ read: true })
            .where(eq(notifications.userId, userId))
            .run();

        res.json({ success: true });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ error: 'Failed to mark all notifications' });
    }
};
