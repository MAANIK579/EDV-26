import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Admin endpoint: list registered students
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
