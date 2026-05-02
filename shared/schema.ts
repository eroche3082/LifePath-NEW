import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  name: text("name"),
  firebaseUid: text("firebase_uid"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  firebaseUid: true,
  profilePicture: true,
});

// Check-ins table
export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  mood: integer("mood"),
  energy: integer("energy").notNull(),
  reflection: text("reflection"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dimensions tracker table
export const dimensionTracker = pgTable("dimension_tracker", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dimension: text("dimension").notNull(), // physical, emotional, intellectual, spiritual, relational
  score: integer("score").notNull(),
  consultation: jsonb("consultation"), // Saved consultation data
  trackers: jsonb("trackers").default({}), // Saved tracker data as JSON
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual trackers
export const trackers = pgTable("trackers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dimension: text("dimension").notNull(),
  name: text("name").notNull(), // sleep, water, mood, meditation, etc.
  value: integer("value").notNull(),
  target: integer("target"),
  unit: text("unit"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Goals table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  dimension: text("dimension").notNull(),
  completed: integer("completed").notNull().default(0),
  total: integer("total").notNull(),
  progress: integer("progress").notNull().default(0),
  deadline: timestamp("deadline"),
  steps: jsonb("steps"), // Array of step objects
  nextStep: text("next_step"),
  nextStepId: integer("next_step_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rituals table
export const rituals = pgTable("rituals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  dimension: text("dimension").notNull(),
  time: text("time").notNull(),
  duration: integer("duration"), // minutes
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Journal entries table
export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  dimension: text("dimension"),
  type: text("type"), // journal, check-in, ritual-completion, etc.
  emotions: jsonb("emotions"), // Array of emotion tags
  audioRecording: text("audio_recording"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User preferences table
export const preferences = pgTable("preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  aiTone: text("ai_tone").default("balanced"),
  aiGender: text("ai_gender").default("neutral"),
  aiSpiritualStyle: text("ai_spiritual_style").default("neutral"),
  language: text("language").default("english"),
  darkMode: boolean("dark_mode").default(true),
  notifications: jsonb("notifications"), // Notification preferences object
  privacy: jsonb("privacy"), // Privacy settings object
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CheckIn = typeof checkIns.$inferSelect;
export type DimensionTracker = typeof dimensionTracker.$inferSelect;
export type Tracker = typeof trackers.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Ritual = typeof rituals.$inferSelect;
export type Journal = typeof journals.$inferSelect;
export type Preference = typeof preferences.$inferSelect;
