import { db } from '../db/index.js';
import { placements, placementApplications, users, notifications } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

// Get all placements and user's application status
export const getPlacements = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Fetch all placements
        const allPlacements = await db.select().from(placements).orderBy(desc(placements.createdAt));

        // Fetch current user's applications
        const userApplications = await db.select()
            .from(placementApplications)
            .where(eq(placementApplications.studentId, studentId));

        // Map applications to placements for easy lookup on frontend
        const appliedSet = new Set(userApplications.map(app => app.placementId));

        const placementsWithStatus = allPlacements.map(placement => ({
            ...placement,
            hasApplied: appliedSet.has(placement.id)
        }));

        res.json(placementsWithStatus);
    } catch (error) {
        console.error('Error fetching placements:', error);
        res.status(500).json({ error: 'Failed to fetch placements.' });
    }
};

// Create a new placement (Admin only)
export const createPlacement = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Require Admin Role' });

    try {
        const { companyName, role, description, salary, deadline, eligibleBatch, type } = req.body;

        const newPlacement = await db.insert(placements).values({
            companyName,
            role,
            description,
            salary,
            deadline: new Date(deadline),
            eligibleBatch,
            type,
            createdBy: req.user.id
        }).returning();

        // Notify all students
        const allStudents = await db.select({ id: users.id }).from(users).where(eq(users.role, 'student'));
        const notifMsg = `🏢 New Placement Drive: ${companyName} is hiring for ${role}!`;

        if (allStudents.length > 0) {
            const notificationsToInsert = allStudents.map(student => ({
                userId: student.id,
                message: notifMsg,
                type: 'placement'
            }));
            await db.insert(notifications).values(notificationsToInsert);
        }

        // Return the created placement with `hasApplied: false` for immediate state update
        res.status(201).json({ ...newPlacement[0], hasApplied: false });
    } catch (error) {
        console.error('Error creating placement:', error);
        res.status(500).json({ error: 'Failed to create placement.' });
    }
};

// Delete a placement (Admin only)
export const deletePlacement = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Require Admin Role' });

    try {
        const { id } = req.params;
        await db.delete(placements).where(eq(placements.id, parseInt(id)));
        res.json({ message: 'Placement deleted successfully.' });
    } catch (error) {
        console.error('Error deleting placement:', error);
        res.status(500).json({ error: 'Failed to delete placement.' });
    }
};

// Toggle placement application (Student only)
export const toggleApplication = async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can apply' });

    try {
        const { id: placementId } = req.params;
        const studentId = req.user.id;

        // Check if already applied
        const existingApp = await db.select()
            .from(placementApplications)
            .where(and(
                eq(placementApplications.placementId, parseInt(placementId)),
                eq(placementApplications.studentId, studentId)
            ));

        if (existingApp.length > 0) {
            // Withdraw application
            await db.delete(placementApplications)
                .where(and(
                    eq(placementApplications.placementId, parseInt(placementId)),
                    eq(placementApplications.studentId, studentId)
                ));
            res.json({ message: 'Application withdrawn successfully.', hasApplied: false });
        } else {
            // Apply bounds checking - ensure placement exists
            const placement = await db.select().from(placements).where(eq(placements.id, parseInt(placementId)));
            if (placement.length === 0) return res.status(404).json({ error: 'Placement not found' });

            // Apply
            await db.insert(placementApplications).values({
                placementId: parseInt(placementId),
                studentId
            });
            res.json({ message: 'Applied successfully.', hasApplied: true });
        }
    } catch (error) {
        console.error('Error toggling placement application:', error);
        res.status(500).json({ error: 'Failed to process application.' });
    }
};
