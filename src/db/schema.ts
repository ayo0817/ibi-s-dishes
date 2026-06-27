import { pgTable, serial, text, integer, timestamp, json, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  password: text('password').notNull(),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address').notNull(),
  landmark: varchar('landmark', { length: 255 }),
  notes: text('notes'),
  items: json('items').notNull(),
  total: integer('total').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  paymentProof: text('payment_proof'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
