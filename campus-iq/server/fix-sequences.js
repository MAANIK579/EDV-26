import dotenv from 'dotenv';
dotenv.config();
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function fixSequences() {
    console.log('Fixing sequences...');
    await sql`SELECT setval('announcements_id_seq', COALESCE((SELECT MAX(id) FROM announcements), 0) + 1, false)`;
    console.log('✅ announcements fixed');
    await sql`SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 0) + 1, false)`;
    console.log('✅ events fixed');
    await sql`SELECT setval('notifications_id_seq', COALESCE((SELECT MAX(id) FROM notifications), 0) + 1, false)`;
    console.log('✅ notifications fixed');
    await sql`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false)`;
    console.log('✅ users fixed');
    console.log('All sequences synced!');
}
fixSequences().catch(console.error);
