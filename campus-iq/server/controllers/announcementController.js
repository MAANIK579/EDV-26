import { db } from '../db/index.js';
import { announcements, notifications, users } from '../db/schema.js';
import { eq, desc, inArray } from 'drizzle-orm';

// GET /api/announcements — filtered by user role
export const getAnnouncements = async (req, res) => {
    try {
        const userRole = req.user.role;

        let result;
        if (userRole === 'admin') {
            result = await db.select({
                id: announcements.id,
                title: announcements.title,
                text: announcements.text,
                priority: announcements.priority,
                targetAudience: announcements.targetAudience,
                createdAt: announcements.createdAt,
                createdBy: announcements.createdBy
            }).from(announcements).orderBy(desc(announcements.createdAt));
        } else {
            const audiences = userRole === 'faculty' ? ['all', 'faculty'] : ['all', 'students'];
            result = await db.select({
                id: announcements.id,
                title: announcements.title,
                text: announcements.text,
                priority: announcements.priority,
                targetAudience: announcements.targetAudience,
                createdAt: announcements.createdAt,
                createdBy: announcements.createdBy
            }).from(announcements)
                .where(inArray(announcements.targetAudience, audiences))
                .orderBy(desc(announcements.createdAt));
        }

        res.json(result);
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
};

// POST /api/announcements — admin creates + notifies targeted users
export const createAnnouncement = async (req, res) => {
    try {
        const { title, text, priority, targetAudience } = req.body;
        const adminId = req.user.id;
        const audience = targetAudience || 'all';

        const newAnn = await db.insert(announcements).values({
            title,
            text: text || '',
            priority: priority || 'normal',
            targetAudience: audience,
            createdBy: adminId
        }).returning();

        // Notify targeted users
        let targetRoles;
        if (audience === 'students') targetRoles = ['student'];
        else if (audience === 'faculty') targetRoles = ['faculty'];
        else targetRoles = ['student', 'faculty'];

        const targetUsers = await db.select({ id: users.id }).from(users)
            .where(inArray(users.role, targetRoles));

        if (targetUsers.length > 0) {
            const audienceLabel = audience === 'students' ? ' (Students)' : audience === 'faculty' ? ' (Faculty)' : '';
            const notifRows = targetUsers.map(u => ({
                userId: u.id,
                message: `📢 New announcement${audienceLabel}: "${title}"`,
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

// DELETE /api/announcements/:id
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
