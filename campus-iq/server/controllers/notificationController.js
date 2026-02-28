import { db } from '../db/index.js';
import { notifications } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.select().from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt));
        res.json(result);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await db.update(notifications)
            .set({ read: true })
            .where(and(eq(notifications.id, parseInt(id)), eq(notifications.userId, userId)));
        res.json({ success: true });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Failed to mark notification read' });
    }
};

export const markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await db.update(notifications)
            .set({ read: true })
            .where(eq(notifications.userId, userId));
        res.json({ success: true });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ error: 'Failed to mark all notifications' });
    }
};
