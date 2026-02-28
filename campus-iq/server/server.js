import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Seed default data if empty (PostgreSQL / Neon) ──
import { db } from './db/index.js';
import { users, rooms, events, announcements, clubs, placements, placementApplications } from './db/schema.js';

async function seedIfEmpty() {
  try {
    const existing = await db.select({ id: users.id }).from(users);
    if (existing.length > 0) return; // Already seeded

    console.log('🌱 Seeding initial data...');

    const adminPass = bcrypt.hashSync('admin123', 10);
    const studentPass = bcrypt.hashSync('student123', 10);

    const insertedUsers = await db.insert(users).values([
      { email: 'admin@campus.edu', password: adminPass, role: 'admin', name: 'Dr. Admin' },
      { email: 'student@campus.edu', password: studentPass, role: 'student', name: 'Rahul Sharma' }
    ]).returning();

    const adminId = insertedUsers.find(u => u.role === 'admin')?.id;

    // Seed rooms
    await db.insert(rooms).values([
      { number: '101', building: 'Main Block', capacity: 60, type: 'Classroom' },
      { number: '102', building: 'Main Block', capacity: 60, type: 'Classroom' },
      { number: '105', building: 'Main Block', capacity: 40, type: 'Classroom' },
      { number: '201', building: 'Main Block', capacity: 100, type: 'Seminar Hall' },
      { number: '301', building: 'Main Block', capacity: 50, type: 'Smart Classroom' },
      { number: 'Lab 204', building: 'CS Block', capacity: 35, type: 'AI/ML Lab' },
      { number: 'Lab 301', building: 'CS Block', capacity: 40, type: 'Programming Lab' },
      { number: 'Lab 303', building: 'CS Block', capacity: 25, type: 'IoT Lab' },
      { number: '402', building: 'Main Block', capacity: 30, type: 'Conference Room' },
      { number: 'Auditorium', building: 'Main Campus', capacity: 500, type: 'Event Space' }
    ]);

    // Seed events
    await db.insert(events).values([
      { title: 'Campus Hackathon 2026', description: 'A 36-hour coding marathon with exciting prizes.', date: new Date(Date.now() + 15 * 86400000), category: 'workshop', venue: 'Main Auditorium' },
      { title: 'SPANDAN Cultural Fest', description: 'Annual cultural fest with performances and food.', date: new Date(Date.now() + 8 * 86400000), category: 'cultural', venue: 'Central Grounds' },
      { title: 'AI/ML Guest Lecture', description: 'Talk by industry expert on latest AI trends.', date: new Date(Date.now() + 3 * 86400000), category: 'academic', venue: 'Room 301' },
      { title: 'Annual Sports Day', description: 'Inter-department sports competitions.', date: new Date(Date.now() + 1 * 86400000), category: 'sports', venue: 'Sports Complex' }
    ]);

    // Seed clubs
    if (adminId) {
      await db.insert(clubs).values([
        { name: 'Google Developer Student Club', description: 'Learn, build, and connect with peer developers.', category: 'technical', createdBy: adminId },
        { name: 'Debate Society', description: 'Enhance your public speaking and argumentation skills.', category: 'cultural', createdBy: adminId },
        { name: 'Photography Club', description: 'Capture moments and learn professional photography.', category: 'arts', createdBy: adminId },
        { name: 'Robotics Wing', description: 'Build autonomous robots and compete in tech fests.', category: 'technical', createdBy: adminId }
      ]);
    }

    // Seed placements
    if (adminId) {
      await db.insert(placements).values([
        { companyName: 'Google', role: 'Software Engineering Intern', description: '12-week summer internship for SWE.', salary: '₹1.5L/month', deadline: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), eligibleBatch: '2025', type: 'Internship', createdBy: adminId },
        { companyName: 'Microsoft', role: 'Product Manager', description: 'Full-time PM role for upcoming graduates.', salary: '₹40LPA', deadline: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), eligibleBatch: '2024', type: 'Full-time', createdBy: adminId },
        { companyName: 'Amazon', role: 'SDE-1', description: 'Full-time SDE role with focus on AWS.', salary: '₹35LPA', deadline: new Date(new Date().getTime() + 21 * 24 * 60 * 60 * 1000), eligibleBatch: '2024', type: 'Full-time', createdBy: adminId }
      ]);
    }

    // Seed announcements
    if (adminId) {
      await db.insert(announcements).values([
        { title: 'Mid-Semester Exams', text: 'Schedule released — starts March 10.', priority: 'urgent', targetAudience: 'all', createdBy: adminId },
        { title: 'Hackathon Registrations Open', text: '36-hour campus hackathon on March 15-16. Register now!', priority: 'normal', targetAudience: 'students', createdBy: adminId },
        { title: 'Library Hours Extended', text: 'Open until 11 PM during exam preparation period.', priority: 'normal', targetAudience: 'all', createdBy: adminId },
        { title: 'Faculty Meeting Agenda', text: 'Monthly faculty meeting on March 5 at 3 PM in Conference Room.', priority: 'normal', targetAudience: 'faculty', createdBy: adminId }
      ]);
    }

    console.log('✅ Seed data created. Default accounts:');
    console.log('   Admin:   admin@campus.edu / admin123');
    console.log('   Student: student@campus.edu / student123');
  } catch (error) {
    console.error('Seed error (may be normal if tables already have data):', error.message);
  }
}

// ── Routes ──
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import placementRoutes from './routes/placementRoutes.js';

import { authMiddleware } from './middleware/authMiddleware.js';
import { eq } from 'drizzle-orm';

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/placements', placementRoutes);

// Admin: get all students
app.get('/api/admin/students', authMiddleware, async (req, res) => {
  try {
    const students = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt
    }).from(users).where(eq(users.role, 'student'));

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusIQ API is running' });
});

// Start server + seed
seedIfEmpty().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
