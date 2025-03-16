import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const entityTypes = ["npc", "creature", "location", "organization"] as const;
export type EntityType = typeof entityTypes[number];

export const relationshipTypes = ["ally", "acquaintance", "enemy"] as const;
export type RelationshipType = typeof relationshipTypes[number];

// Add user table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  created: timestamp("created").notNull().defaultNow(),
});

// Update journals to include user reference
export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().notNull(),
  created: timestamp("created").notNull().defaultNow(),
});

// Update entities to include user reference
export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type", { enum: entityTypes }).notNull(),
  description: text("description").notNull(),
  properties: json("properties").notNull().$type<Record<string, any>>(),
  tags: text("tags").array().notNull(),
  created: timestamp("created").notNull().defaultNow(),
});

export const insertJournalSchema = createInsertSchema(journals).omit({ 
  id: true,
  userId: true,
  created: true 
});

export const insertEntitySchema = createInsertSchema(entities).omit({ 
  id: true,
  userId: true,
  created: true 
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created: true
});

export type Journal = typeof journals.$inferSelect;
export type InsertJournal = z.infer<typeof insertJournalSchema>;
export type Entity = typeof entities.$inferSelect;
export type InsertEntity = z.infer<typeof insertEntitySchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const entityTemplates: Record<EntityType, Record<string, any>> = {
  npc: {
    race: "",
    class: "",
    alignment: "",
    location: "",
    relationship: "", 
    organization: "", 
  },
  creature: {
    type: "",
    size: "",
    alignment: "",
    habitat: "",
    challengeRating: "",
  },
  location: {
    type: "",
    climate: "",
    population: "",
    government: "",
    description: "",
    activeOrganizations: [], 
  },
  organization: {
    type: "",
    alignment: "",
    headquarters: "", 
    leader: "",
    goals: "",
  },
};