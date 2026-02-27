import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Create tables on startup ──
import { sqlite } from './db/index.js';

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    name TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    category TEXT,
    venue TEXT,
    created_by INTEGER REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES users(id),
    event_id INTEGER NOT NULL REFERENCES events(id),
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT NOT NULL,
    building TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    type TEXT,
    status_override TEXT
  );
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    text TEXT,
    priority TEXT DEFAULT 'normal',
    target_audience TEXT DEFAULT 'all',
    created_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// ── Seed default data if empty ──
import bcrypt from 'bcryptjs';

const userCount = sqlite.prepare('SELECT COUNT(*) as cnt FROM users').get();
if (userCount.cnt === 0) {
  console.log('🌱 Seeding initial data...');
  const adminPass = bcrypt.hashSync('admin123', 10);
  const studentPass = bcrypt.hashSync('student123', 10);

  sqlite.prepare(`INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)`).run('admin@campus.edu', adminPass, 'admin', 'Dr. Admin');
  sqlite.prepare(`INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)`).run('student@campus.edu', studentPass, 'student', 'Rahul Sharma');

  // Seed rooms
  const roomData = [
    ['101', 'Main Block', 60, 'Classroom'],
    ['102', 'Main Block', 60, 'Classroom'],
    ['105', 'Main Block', 40, 'Classroom'],
    ['201', 'Main Block', 100, 'Seminar Hall'],
    ['301', 'Main Block', 50, 'Smart Classroom'],
    ['Lab 204', 'CS Block', 35, 'AI/ML Lab'],
    ['Lab 301', 'CS Block', 40, 'Programming Lab'],
    ['Lab 303', 'CS Block', 25, 'IoT Lab'],
    ['402', 'Main Block', 30, 'Conference Room'],
    ['Auditorium', 'Main Campus', 500, 'Event Space'],
  ];
  const insertRoom = sqlite.prepare('INSERT INTO rooms (number, building, capacity, type) VALUES (?, ?, ?, ?)');
  roomData.forEach(r => insertRoom.run(...r));

  // Seed events
  const seedEvents = [
    ['Campus Hackathon 2026', 'A 36-hour coding marathon with exciting prizes.', new Date(Date.now() + 15 * 86400000).toISOString(), 'workshop', 'Main Auditorium'],
    ['SPANDAN Cultural Fest', 'Annual cultural fest with performances and food.', new Date(Date.now() + 8 * 86400000).toISOString(), 'cultural', 'Central Grounds'],
    ['AI/ML Guest Lecture', 'Talk by industry expert on latest AI trends.', new Date(Date.now() + 3 * 86400000).toISOString(), 'academic', 'Room 301'],
    ['Annual Sports Day', 'Inter-department sports competitions.', new Date(Date.now() + 1 * 86400000).toISOString(), 'sports', 'Sports Complex'],
  ];
  const insertEvent = sqlite.prepare('INSERT INTO events (title, description, date, category, venue) VALUES (?, ?, ?, ?, ?)');
  seedEvents.forEach(e => insertEvent.run(...e));

  // Seed announcements
  const admin = sqlite.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  const seedAnnouncements = [
    ['Mid-Semester Exams', 'Schedule released — starts March 10.', 'urgent', 'all', admin.id],
    ['Hackathon Registrations Open', '36-hour campus hackathon on March 15-16. Register now!', 'normal', 'students', admin.id],
    ['Library Hours Extended', 'Open until 11 PM during exam preparation period.', 'normal', 'all', admin.id],
    ['Faculty Meeting Agenda', 'Monthly faculty meeting on March 5 at 3 PM in Conference Room.', 'normal', 'faculty', admin.id],
  ];
  const insertAnn = sqlite.prepare('INSERT INTO announcements (title, text, priority, target_audience, created_by) VALUES (?, ?, ?, ?, ?)');
  seedAnnouncements.forEach(a => insertAnn.run(...a));

  console.log('✅ Seed data created. Default accounts:');
  console.log('   Admin:   admin@campus.edu / admin123');
  console.log('   Student: student@campus.edu / student123');
}

// ── Routes ──
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import { authMiddleware } from './middleware/authMiddleware.js';
import { db } from './db/index.js';
import { users } from './db/schema.js';
import { eq } from 'drizzle-orm';

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);

// Admin: get all students
app.get('/api/admin/students', authMiddleware, async (req, res) => {
  try {
    const students = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt
    }).from(users).where(eq(users.role, 'student')).all();

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusIQ API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
