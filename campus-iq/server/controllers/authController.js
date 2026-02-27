import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

export const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        console.log('Register attempt:', { email, name, role });

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        console.log('Existing user check:', existingUser.length);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Password hashed successfully');

        // Insert new user
        const newUser = await db.insert(users).values({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0],
            role: role || 'student'
        }).returning();

        console.log('User inserted:', newUser[0]?.id);

        // Generate token
        const token = jwt.sign(
            { id: newUser[0].id, role: newUser[0].role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            user: {
                id: newUser[0].id,
                email: newUser[0].email,
                role: newUser[0].role,
                name: newUser[0].name
            },
            token
        });

    } catch (error) {
        console.error('Registration Error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const foundUser = await db.select().from(users).where(eq(users.email, email));
        if (foundUser.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = foundUser[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token
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
                name: user.name
            },
            token
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
};
