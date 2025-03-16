import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const entityTypes = ["npc", "creature", "location", "organization"] as const;
export type EntityType = typeof entityTypes[number];

export const relationshipTypes = ["ally", "acquaintance", "enemy"] as const;
export type RelationshipType = typeof relationshipTypes[number];

export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().notNull(),
  created: timestamp("created").notNull().defaultNow(),
});

export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: entityTypes }).notNull(),
  description: text("description").notNull(),
  properties: json("properties").notNull().$type<Record<string, any>>(),
  tags: text("tags").array().notNull(),
  created: timestamp("created").notNull().defaultNow(),
});

export const insertJournalSchema = createInsertSchema(journals).omit({ 
  id: true,
  created: true 
});

export const insertEntitySchema = createInsertSchema(entities).omit({ 
  id: true,
  created: true 
});

export type Journal = typeof journals.$inferSelect;
export type InsertJournal = z.infer<typeof insertJournalSchema>;
export type Entity = typeof entities.$inferSelect;
export type InsertEntity = z.infer<typeof insertEntitySchema>;

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