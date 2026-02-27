import { pgTable, serial, text, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

// Users
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: text('password').notNull(),
    role: varchar('role', { length: 50 }).notNull().default('student'),
    name: varchar('name', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow()
});

// To-Do items
export const todos = pgTable('todos', {
    id: serial('id').primaryKey(),
    studentId: integer('student_id').references(() => users.id).notNull(),
    text: text('text').notNull(),
    done: boolean('done').default(false),
    createdAt: timestamp('created_at').defaultNow()
});

// Campus Events
export const events = pgTable('events', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    date: timestamp('date').notNull(),
    category: varchar('category', { length: 100 }),
    venue: varchar('venue', { length: 255 }),
    createdBy: integer('created_by').references(() => users.id)
});

// RSVPs
export const rsvps = pgTable('rsvps', {
    id: serial('id').primaryKey(),
    studentId: integer('student_id').references(() => users.id).notNull(),
    eventId: integer('event_id').references(() => events.id).notNull(),
    createdAt: timestamp('created_at').defaultNow()
});

// Rooms
export const rooms = pgTable('rooms', {
    id: serial('id').primaryKey(),
    number: varchar('number', { length: 50 }).notNull(),
    building: varchar('building', { length: 255 }).notNull(),
    capacity: integer('capacity').notNull(),
    type: varchar('type', { length: 100 }),
    statusOverride: varchar('status_override', { length: 50 })
});

// Announcements
export const announcements = pgTable('announcements', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    text: text('text'),
    priority: varchar('priority', { length: 50 }).default('normal'),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow()
});

// Notifications
export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    message: text('message').notNull(),
    type: varchar('type', { length: 50 }).default('info'),
    read: boolean('read').default(false),
    createdAt: timestamp('created_at').defaultNow()
});
