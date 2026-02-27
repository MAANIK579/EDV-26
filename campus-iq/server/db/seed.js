import { db } from './index.js';
import { events, rooms } from './schema.js';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('🌱 Starting seed...');

    // Seed Events
    const existingEvents = await db.select().from(events);
    if (existingEvents.length === 0) {
        console.log('Seeding Events...');
        await db.insert(events).values([
            { title: 'Tech Symposium 2026', description: 'Annual tech gathering featuring AI keynotes.', date: new Date(new Date().setDate(new Date().getDate() + 2)), category: 'academic', venue: 'Main Auditorium' },
            { title: 'Campus Music Fest', description: 'Live bands and food trucks.', date: new Date(new Date().setDate(new Date().getDate() + 5)), category: 'social', venue: 'Central Grounds' },
            { title: 'Career Fair', description: 'Meet top recruiters from tech companies.', date: new Date(new Date().setDate(new Date().getDate() + 10)), category: 'career', venue: 'Student Center' },
            { title: 'Basketball Tryouts', description: 'Join the university varsity team.', date: new Date(new Date().setDate(new Date().getDate() + 1)), category: 'sports', venue: 'Sports Complex' }
        ]);
    } else {
        console.log('Events already seeded.');
    }

    // Seed Rooms
    const existingRooms = await db.select().from(rooms);
    if (existingRooms.length === 0) {
        console.log('Seeding Rooms...');
        await db.insert(rooms).values([
            { number: '101', building: 'Engineering Block', capacity: 60, type: 'Lecture Hall' },
            { number: '204', building: 'Science Block', capacity: 30, type: 'Lab' },
            { number: '305', building: 'Arts Building', capacity: 40, type: 'Classroom' },
            { number: 'Auditorium', building: 'Main Campus', capacity: 500, type: 'Event Space' },
            { number: 'Lib-1', building: 'Central Library', capacity: 10, type: 'Study Room' }
        ]);
    } else {
        console.log('Rooms already seeded.');
    }

    console.log('✅ Seeding complete!');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
