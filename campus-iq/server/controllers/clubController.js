import { db } from '../db/index.js';
import { clubs, clubMembers, notifications, users } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// GET /api/clubs — get all clubs + RSVP status for logged-in student
export const getClubs = async (req, res) => {
    try {
        const userId = req.user.id;
        const allClubs = await db.select().from(clubs);

        // Fetch user's club memberships
        const userMemberships = await db.select().from(clubMembers).where(eq(clubMembers.studentId, userId));
        const memberClubIds = new Set(userMemberships.map(m => m.clubId));

        const clubsWithMembership = allClubs.map(club => ({
            ...club,
            isMember: memberClubIds.has(club.id)
        }));

        res.json(clubsWithMembership);
    } catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
};

// POST /api/clubs — admin creates a new club
export const createClub = async (req, res) => {
    try {
        const { name, description, category } = req.body;
        const adminId = req.user.id;

        const newClub = await db.insert(clubs).values({
            name,
            description: description || '',
            category: category || 'general',
            createdBy: adminId
        }).returning();

        // Notify all students about the new club
        const allStudents = await db.select({ id: users.id }).from(users).where(eq(users.role, 'student'));
        if (allStudents.length > 0) {
            const notifRows = allStudents.map(s => ({
                userId: s.id,
                message: `✨ New Club Alert: Join the "${name}" club today!`,
                type: 'info'
            }));
            await db.insert(notifications).values(notifRows);
        }

        res.status(201).json(newClub[0]);
    } catch (error) {
        console.error('Error creating club:', error);
        res.status(500).json({ error: 'Failed to create club' });
    }
};

// DELETE /api/clubs/:id — admin deletes club
export const deleteClub = async (req, res) => {
    try {
        const clubId = parseInt(req.params.id);
        // Wipe memberships first due to FK constraints
        await db.delete(clubMembers).where(eq(clubMembers.clubId, clubId));
        await db.delete(clubs).where(eq(clubs.id, clubId));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting club:', error);
        res.status(500).json({ error: 'Failed to delete club' });
    }
};

// POST /api/clubs/:id/toggle — student joins or leaves club
export const toggleClubMembership = async (req, res) => {
    try {
        const studentId = req.user.id;
        const clubId = parseInt(req.params.id);

        const existingMembership = await db.select().from(clubMembers)
            .where(and(eq(clubMembers.studentId, studentId), eq(clubMembers.clubId, clubId)));

        if (existingMembership.length > 0) {
            // Leave club
            await db.delete(clubMembers).where(eq(clubMembers.id, existingMembership[0].id));
            res.json({ message: 'Left club', clubId, status: 'left' });
        } else {
            // Join club
            await db.insert(clubMembers).values({ studentId, clubId });
            res.json({ message: 'Joined club', clubId, status: 'joined' });
        }
    } catch (error) {
        console.error('Error toggling club membership:', error);
        res.status(500).json({ error: 'Failed to toggle club membership' });
    }
};

// GET /api/clubs/:id/members — admin views members of a club
export const getClubMembers = async (req, res) => {
    // Basic admin check (could use proper RBAC midleware)
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Require Admin Role' });
    }

    try {
        const clubId = parseInt(req.params.id);

        // Join clubMembers with users to get name and email
        const members = await db.select({
            id: clubMembers.id,
            studentId: users.id,
            name: users.name,
            email: users.email,
            role: clubMembers.role,
            joinedAt: clubMembers.joinedAt
        })
            .from(clubMembers)
            .innerJoin(users, eq(clubMembers.studentId, users.id))
            .where(eq(clubMembers.clubId, clubId));

        res.json(members);
    } catch (error) {
        console.error('Error fetching club members:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
};

// PATCH /api/clubs/:id/members/:studentId — admin updates a member's role
export const updateMemberRole = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Require Admin Role' });
    }

    try {
        const clubId = parseInt(req.params.id);
        const studentId = parseInt(req.params.studentId);
        const { role } = req.body;

        if (!role) return res.status(400).json({ error: 'Role is required' });

        await db.update(clubMembers)
            .set({ role })
            .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.studentId, studentId)));

        res.json({ message: 'Role updated successfully', role });
    } catch (error) {
        console.error('Error updating member role:', error);
        res.status(500).json({ error: 'Failed to update member role' });
    }
};
