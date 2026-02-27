import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users
export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull().default('student'),
    name: text('name'),
    createdAt: text('created_at').default(sql`(datetime('now'))`)
});

// To-Do items
export const todos = sqliteTable('todos', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    studentId: integer('student_id').references(() => users.id).notNull(),
    text: text('text').notNull(),
    done: integer('done', { mode: 'boolean' }).default(false),
    createdAt: text('created_at').default(sql`(datetime('now'))`)
});

// Campus Events
export const events = sqliteTable('events', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    description: text('description'),
    date: text('date').notNull(),
    category: text('category'),
    venue: text('venue'),
    createdBy: integer('created_by').references(() => users.id)
});

// RSVPs
export const rsvps = sqliteTable('rsvps', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    studentId: integer('student_id').references(() => users.id).notNull(),
    eventId: integer('event_id').references(() => events.id).notNull(),
    createdAt: text('created_at').default(sql`(datetime('now'))`)
});

// Rooms
export const rooms = sqliteTable('rooms', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    number: text('number').notNull(),
    building: text('building').notNull(),
    capacity: integer('capacity').notNull(),
    type: text('type'),
    statusOverride: text('status_override')
});

// Announcements
export const announcements = sqliteTable('announcements', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    text: text('text'),
    priority: text('priority').default('normal'),
    targetAudience: text('target_audience').default('all'),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: text('created_at').default(sql`(datetime('now'))`)
});

// Notifications
export const notifications = sqliteTable('notifications', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').references(() => users.id).notNull(),
    message: text('message').notNull(),
    type: text('type').default('info'),
    read: integer('read', { mode: 'boolean' }).default(false),
    createdAt: text('created_at').default(sql`(datetime('now'))`)
});
