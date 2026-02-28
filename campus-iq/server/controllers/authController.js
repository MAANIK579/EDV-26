import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

export const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.insert(users).values({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0],
            role: role || 'student'
        }).returning();

        const newUser = result[0];

        const token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                name: newUser.name,
                rollNo: newUser.rollNo,
                course: newUser.course,
                semester: newUser.semester,
                block: newUser.block,
                fatherName: newUser.fatherName,
                motherName: newUser.motherName
            },
            token
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const foundUser = await db.select().from(users).where(eq(users.email, email));
        if (foundUser.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = foundUser[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                rollNo: user.rollNo,
                course: user.course,
                semester: user.semester,
                block: user.block,
                fatherName: user.fatherName,
                motherName: user.motherName
            },
            token
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, rollNo, course, semester, block, fatherName, motherName } = req.body;

        const result = await db.update(users)
            .set({
                name,
                rollNo,
                course,
                semester: semester ? parseInt(semester) : null,
                block,
                fatherName,
                motherName
            })
            .where(eq(users.id, userId))
            .returning();

        const updatedUser = result[0];
        if (updatedUser) delete updatedUser.password;

        res.json({
            success: true,
            user: updatedUser
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
