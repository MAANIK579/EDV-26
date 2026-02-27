import { db } from '../db/index.js';
import { rooms } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Get all rooms
export const getRooms = async (req, res) => {
    try {
        const allRooms = await db.select().from(rooms);
        res.json(allRooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

// PATCH /api/rooms/:id — admin override room status
export const updateRoomStatus = async (req, res) => {
    try {
        const roomId = parseInt(req.params.id);
        const { statusOverride } = req.body; // 'available', 'occupied', or null (auto)

        await db.update(rooms)
            .set({ statusOverride: statusOverride || null })
            .where(eq(rooms.id, roomId));

        res.json({ success: true, roomId, statusOverride });
    } catch (error) {
        console.error('Error updating room status:', error);
        res.status(500).json({ error: 'Failed to update room status' });
    }
};
