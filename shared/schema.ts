import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the valid entity types for our D&D application
export const entityTypes = ["npc", "creature", "location", "organization"] as const;
export type EntityType = typeof entityTypes[number];

// Define the types of relationships that can exist between NPCs
export const relationshipTypes = ["ally", "acquaintance", "enemy"] as const;
export type RelationshipType = typeof relationshipTypes[number];

// User table definition - stores basic user account information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  created: timestamp("created").notNull().defaultNow(),
});

// Journal table definition - stores campaign notes and session logs
// Each journal is associated with a user through userId
export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().notNull(),
  created: timestamp("created").notNull().defaultNow(),
});

// Entity table definition - stores NPCs, creatures, locations, and organizations
// Each entity is associated with a user through userId
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

// Create Zod schemas for validation, excluding auto-generated fields
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

// User schema with password validation rules
export const insertUserSchema = createInsertSchema(users)
  .extend({
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
  })
  .omit({
    id: true,
    created: true
  });

// Export TypeScript types for use throughout the application
export type Journal = typeof journals.$inferSelect;
export type InsertJournal = z.infer<typeof insertJournalSchema>;
export type Entity = typeof entities.$inferSelect;
export type InsertEntity = z.infer<typeof insertEntitySchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Templates for different entity types defining their specific properties
export const entityTemplates: Record<EntityType, Record<string, any>> = {
  npc: {
    race: "",
    class: "",
    alignment: "",
    location: "",
    relationship: "", // Relationship with the party
    organization: "", // Organization membership
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
    activeOrganizations: [], // Organizations present in this location
  },
  organization: {
    type: "",
    alignment: "",
    headquarters: "", // Reference to a location
    leader: "",
    goals: "",
  },
};