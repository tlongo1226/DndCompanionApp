import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertJournalSchema, insertEntitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express) {
  // Journals
  app.get("/api/journals", async (req, res) => {
    const journals = await storage.getJournals();
    res.json(journals);
  });

  app.get("/api/journals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const journal = await storage.getJournal(id);
    if (!journal) {
      res.status(404).json({ message: "Journal not found" });
      return;
    }
    res.json(journal);
  });

  app.post("/api/journals", async (req, res) => {
    const result = insertJournalSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid journal data" });
      return;
    }
    const journal = await storage.createJournal(result.data);
    res.json(journal);
  });

  app.patch("/api/journals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertJournalSchema.partial().safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid journal data" });
      return;
    }
    try {
      const journal = await storage.updateJournal(id, result.data);
      res.json(journal);
    } catch (e) {
      res.status(404).json({ message: "Journal not found" });
    }
  });

  app.delete("/api/journals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteJournal(id);
    res.status(204).end();
  });

  // Entities
  app.get("/api/entities", async (req, res) => {
    const type = req.query.type as string | undefined;
    const entities = await storage.getEntities(type);
    res.json(entities);
  });

  app.get("/api/entities/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const entity = await storage.getEntity(id);
    if (!entity) {
      res.status(404).json({ message: "Entity not found" });
      return;
    }
    res.json(entity);
  });

  app.post("/api/entities", async (req, res) => {
    const result = insertEntitySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid entity data" });
      return;
    }
    const entity = await storage.createEntity(result.data);
    res.json(entity);
  });

  app.patch("/api/entities/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = insertEntitySchema.partial().safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid entity data" });
      return;
    }
    try {
      const entity = await storage.updateEntity(id, result.data);
      res.json(entity);
    } catch (e) {
      res.status(404).json({ message: "Entity not found" });
    }
  });

  app.delete("/api/entities/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteEntity(id);
    res.status(204).end();
  });

  return createServer(app);
}
