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
    targetAudience: varchar('target_audience', { length: 50 }).default('all'),
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

// Clubs
export const clubs = pgTable('clubs', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 100 }).notNull(), // technical, cultural, sports, etc.
    createdBy: integer('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow()
});

// Club Members
export const clubMembers = pgTable('club_members', {
    id: serial('id').primaryKey(),
    studentId: integer('student_id').references(() => users.id).notNull(),
    clubId: integer('club_id').references(() => clubs.id).notNull(),
    role: varchar('role', { length: 50 }).default('Member'),
    joinedAt: timestamp('joined_at').defaultNow()
});

// Placements
export const placements = pgTable('placements', {
    id: serial('id').primaryKey(),
    companyName: varchar('company_name', { length: 255 }).notNull(),
    role: varchar('role', { length: 255 }).notNull(),
    description: text('description'),
    salary: varchar('salary', { length: 100 }).notNull(),
    deadline: timestamp('deadline').notNull(),
    eligibleBatch: varchar('eligible_batch', { length: 100 }),
    type: varchar('type', { length: 50 }).notNull(),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow()
});

// Placement Applications
export const placementApplications = pgTable('placement_applications', {
    id: serial('id').primaryKey(),
    placementId: integer('placement_id').references(() => placements.id, { onDelete: 'cascade' }).notNull(),
    studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    appliedAt: timestamp('applied_at').defaultNow()
});
