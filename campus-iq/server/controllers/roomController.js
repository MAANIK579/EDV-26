import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

import { db } from '../db/index.js';
import { rooms } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const getRooms = async (req, res) => {
    try {
        const allRooms = await db.select().from(rooms);
        res.json(allRooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

export const updateRoomStatus = async (req, res) => {
    try {
        const roomId = parseInt(req.params.id);
        const { statusOverride } = req.body;
        await db.update(rooms)
            .set({ statusOverride: statusOverride || null })
            .where(eq(rooms.id, roomId));
        res.json({ success: true, roomId, statusOverride });
    } catch (error) {
        console.error('Error updating room status:', error);
        res.status(500).json({ error: 'Failed to update room status' });
    }
};

export const uploadRoomSchedule = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('--- START PDF PROCESSING ---');
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        const textContent = result.text;

        console.log('--- EXTRACTED PDF TEXT START ---');
        console.log(textContent);
        console.log('--- EXTRACTED PDF TEXT END ---');

        // Simple heuristic parser:
        // We look for room numbers that exist in our DB.
        const allRegisteredRooms = await db.select().from(rooms);
        const roomNumbers = allRegisteredRooms.map(r => r.number);

        const lines = textContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const schedulesByRoom = {};

        let currentRoom = null;

        // Pattern for time: 09:00, 9 AM, 14:00, 9-10 AM, etc.
        const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i;

        for (const line of lines) {
            try {
                console.log(`Processing line: "${line}"`);

                // 1. Check if line contains a room number
                const matchedRoom = roomNumbers.find(rn => {
                    const normalizedLine = line.toLowerCase();
                    const normalizedRN = rn.toLowerCase();
                    // Match "R101", "Room 101", "101", etc.
                    return normalizedLine.includes(normalizedRN) ||
                        (normalizedRN.length > 1 && normalizedLine.includes(normalizedRN.substring(1)));
                });

                // If found, update currentRoom (or stay with previous if not found on this specific line)
                if (matchedRoom) {
                    currentRoom = matchedRoom;
                    console.log(`Detection: [UPDATE] Current Room ID -> ${currentRoom}`);
                    if (!schedulesByRoom[currentRoom]) schedulesByRoom[currentRoom] = {};
                }

                if (currentRoom) {
                    const timeMatch = line.match(timeRegex);
                    if (timeMatch) {
                        let hour = parseInt(timeMatch[1]);
                        const ampm = timeMatch[3];

                        if (ampm && ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
                        if (ampm && ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;

                        // Identify class name by removing the time and room number from the string
                        let className = line.replace(timeMatch[0], '');
                        if (matchedRoom) className = className.replace(matchedRoom, '');

                        // Clean up punctuation/whitespace
                        className = className.replace(/^[-–\s:|]+/, '').replace(/[-–\s:|]+$/, '').trim();

                        if (!className && line.toLowerCase().includes('occupied')) className = 'Occupied';
                        if (!className && line.toLowerCase().includes('reserved')) className = 'Reserved';

                        if (className && className.length > 2) {
                            console.log(`Detection: Room ${currentRoom} @ ${hour}:00 -> "${className}"`);
                            schedulesByRoom[currentRoom][hour.toString()] = className;
                        }
                    }
                }
            } catch (lineErr) {
                console.error(`Error parsing line "${line}":`, lineErr);
            }
        }

        console.log('Final Extracted Schedule:', JSON.stringify(schedulesByRoom, null, 2));

        // Update DB
        for (const [roomNum, schedule] of Object.entries(schedulesByRoom)) {
            await db.update(rooms)
                .set({ schedule })
                .where(eq(rooms.number, roomNum));
        }

        if (Object.keys(schedulesByRoom).length === 0) {
            return res.status(422).json({
                success: false,
                error: 'Could not detect any room schedules in the PDF.',
                debug: textContent.substring(0, 100) + '...'
            });
        }

        res.json({
            success: true,
            message: `Processed PDF. Updated schedules for ${Object.keys(schedulesByRoom).length} rooms.`,
            extracted: schedulesByRoom
        });
    } catch (error) {
        console.error('Error parsing room schedule PDF:', error);
        res.status(500).json({ error: `Parsing error: ${error.message}` });
    }
};
