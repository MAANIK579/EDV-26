import { db } from '../db/index.js';
import { announcements, notifications, users } from '../db/schema.js';
import { eq, desc, or, inArray } from 'drizzle-orm';

// GET /api/announcements — filtered by user role
export const getAnnouncements = (req, res) => {
    try {
        const userRole = req.user.role; // 'admin', 'student', 'faculty'

        let result;
        if (userRole === 'admin') {
            // Admin sees ALL announcements
            result = db.select({
                id: announcements.id,
                title: announcements.title,
                text: announcements.text,
                priority: announcements.priority,
                targetAudience: announcements.targetAudience,
                createdAt: announcements.createdAt,
                createdBy: announcements.createdBy
            }).from(announcements).orderBy(desc(announcements.createdAt)).all();
        } else {
            // Students see 'all' + 'students' only; Faculty see 'all' + 'faculty' only
            const audiences = userRole === 'faculty' ? ['all', 'faculty'] : ['all', 'students'];
            result = db.select({
                id: announcements.id,
                title: announcements.title,
                text: announcements.text,
                priority: announcements.priority,
                targetAudience: announcements.targetAudience,
                createdAt: announcements.createdAt,
                createdBy: announcements.createdBy
            }).from(announcements)
                .where(inArray(announcements.targetAudience, audiences))
                .orderBy(desc(announcements.createdAt)).all();
        }

        res.json(result);
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
};

// POST /api/announcements — admin-only: create + notify targeted users
export const createAnnouncement = (req, res) => {
    try {
        const { title, text, priority, targetAudience } = req.body;
        const adminId = req.user.id;
        const audience = targetAudience || 'all';

        // Insert announcement
        const newAnn = db.insert(announcements).values({
            title,
            text: text || '',
            priority: priority || 'normal',
            targetAudience: audience,
            createdBy: adminId
        }).returning().all();

        // Notify targeted users
        let targetRoles;
        if (audience === 'students') {
            targetRoles = ['student'];
        } else if (audience === 'faculty') {
            targetRoles = ['faculty'];
        } else {
            targetRoles = ['student', 'faculty'];
        }

        const targetUsers = db.select({ id: users.id }).from(users)
            .where(inArray(users.role, targetRoles)).all();

        if (targetUsers.length > 0) {
            const audienceLabel = audience === 'students' ? ' (Students)' : audience === 'faculty' ? ' (Faculty)' : '';
            for (const u of targetUsers) {
                db.insert(notifications).values({
                    userId: u.id,
                    message: `📢 New announcement${audienceLabel}: "${title}"`,
                    type: priority === 'urgent' ? 'urgent' : 'info'
                }).run();
            }
        }

        res.status(201).json(newAnn[0]);
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
};

// DELETE /api/announcements/:id — admin-only
export const deleteAnnouncement = (req, res) => {
    try {
        const { id } = req.params;
        db.delete(announcements).where(eq(announcements.id, parseInt(id))).run();
        res.json({ success: true });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
};
