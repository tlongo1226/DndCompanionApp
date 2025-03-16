import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertJournalSchema, insertEntitySchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express) {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Journal Routes
  // GET /api/journals - Get all journals for the authenticated user
  app.get("/api/journals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const journals = await storage.getJournals(req.user.id);
    res.json(journals);
  });

  // GET /api/journals/:id - Get a specific journal by ID
  app.get("/api/journals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const journal = await storage.getJournal(id);
    if (!journal) {
      res.status(404).json({ message: "Journal not found" });
      return;
    }
    // Only return journals owned by the authenticated user
    if (journal.userId !== req.user.id) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    res.json(journal);
  });

  // POST /api/journals - Create a new journal
  app.post("/api/journals", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const result = insertJournalSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid journal data" });
      return;
    }
    const journal = await storage.createJournal({
      ...result.data,
      userId: req.user.id,
    });
    res.json(journal);
  });

  // PATCH /api/journals/:id - Update an existing journal
  app.patch("/api/journals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const result = insertJournalSchema.partial().safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid journal data" });
      return;
    }
    try {
      const journal = await storage.getJournal(id);
      if (!journal) {
        res.status(404).json({ message: "Journal not found" });
        return;
      }
      // Only allow updates to journals owned by the authenticated user
      if (journal.userId !== req.user.id) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
      const updatedJournal = await storage.updateJournal(id, result.data);
      res.json(updatedJournal);
    } catch (e) {
      res.status(404).json({ message: "Journal not found" });
    }
  });

  // DELETE /api/journals/:id - Delete a journal
  app.delete("/api/journals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const journal = await storage.getJournal(id);
    if (!journal) {
      res.status(404).json({ message: "Journal not found" });
      return;
    }
    // Only allow deletion of journals owned by the authenticated user
    if (journal.userId !== req.user.id) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    await storage.deleteJournal(id);
    res.status(204).end();
  });

  // Entity Routes
  // GET /api/entities - Get all entities for the authenticated user
  app.get("/api/entities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const type = req.query.type as string | undefined;
    const entities = await storage.getEntities(type, req.user.id);
    res.json(entities);
  });

  // GET /api/entities/:id - Get a specific entity by ID
  app.get("/api/entities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const entity = await storage.getEntity(id);
    if (!entity) {
      res.status(404).json({ message: "Entity not found" });
      return;
    }
    // Only return entities owned by the authenticated user
    if (entity.userId !== req.user.id) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    res.json(entity);
  });

  // POST /api/entities - Create a new entity
  app.post("/api/entities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const result = insertEntitySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid entity data" });
      return;
    }
    const entity = await storage.createEntity({
      ...result.data,
      userId: req.user.id,
    });
    res.json(entity);
  });

  // PATCH /api/entities/:id - Update an existing entity
  app.patch("/api/entities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const result = insertEntitySchema.partial().safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid entity data" });
      return;
    }
    try {
      const entity = await storage.getEntity(id);
      if (!entity) {
        res.status(404).json({ message: "Entity not found" });
        return;
      }
      // Only allow updates to entities owned by the authenticated user
      if (entity.userId !== req.user.id) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
      const updatedEntity = await storage.updateEntity(id, result.data);
      res.json(updatedEntity);
    } catch (e) {
      res.status(404).json({ message: "Entity not found" });
    }
  });

  // DELETE /api/entities/:id - Delete an entity
  app.delete("/api/entities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const entity = await storage.getEntity(id);
    if (!entity) {
      res.status(404).json({ message: "Entity not found" });
      return;
    }
    // Only allow deletion of entities owned by the authenticated user
    if (entity.userId !== req.user.id) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    await storage.deleteEntity(id);
    res.status(204).end();
  });

  // DELETE /api/user - Delete user account and all associated data
  app.delete("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Delete all user's journals
      const journals = await storage.getJournals(req.user.id);
      await Promise.all(journals.map(journal => storage.deleteJournal(journal.id)));

      // Delete all user's entities
      const entities = await storage.getEntities(undefined, req.user.id);
      await Promise.all(entities.map(entity => storage.deleteEntity(entity.id)));

      // Logout the user
      req.logout((err) => {
        if (err) throw err;
        res.sendStatus(200);
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  return createServer(app);
}