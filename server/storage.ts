import { Journal, Entity, InsertJournal, InsertEntity, InsertUser, User } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Journals
  getJournals(userId: number): Promise<Journal[]>;
  getJournal(id: number): Promise<Journal | undefined>;
  createJournal(journal: InsertJournal & { userId: number }): Promise<Journal>;
  updateJournal(id: number, journal: Partial<InsertJournal>): Promise<Journal>;
  deleteJournal(id: number): Promise<void>;

  // Entities
  getEntities(type?: string, userId?: number): Promise<Entity[]>;
  getEntity(id: number): Promise<Entity | undefined>;
  createEntity(entity: InsertEntity & { userId: number }): Promise<Entity>;
  updateEntity(id: number, entity: Partial<InsertEntity>): Promise<Entity>;
  deleteEntity(id: number): Promise<void>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private journals: Map<number, Journal>;
  private entities: Map<number, Entity>;
  private users: Map<number, User>;
  private journalId: number;
  private entityId: number;
  private userId: number;
  sessionStore: session.Store;

  constructor() {
    this.journals = new Map();
    this.entities = new Map();
    this.users = new Map();
    this.journalId = 1;
    this.entityId = 1;
    this.userId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = {
      ...user,
      id,
      created: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Updated Journal methods to include userId
  async getJournals(userId: number): Promise<Journal[]> {
    return Array.from(this.journals.values()).filter(j => j.userId === userId);
  }

  async getJournal(id: number): Promise<Journal | undefined> {
    return this.journals.get(id);
  }

  async createJournal(journal: InsertJournal & { userId: number }): Promise<Journal> {
    const id = this.journalId++;
    const newJournal: Journal = {
      ...journal,
      id,
      created: new Date(),
    };
    this.journals.set(id, newJournal);
    return newJournal;
  }

  async updateJournal(id: number, journal: Partial<InsertJournal>): Promise<Journal> {
    const existing = await this.getJournal(id);
    if (!existing) throw new Error("Journal not found");

    const updated: Journal = {
      ...existing,
      ...journal,
    };
    this.journals.set(id, updated);
    return updated;
  }

  async deleteJournal(id: number): Promise<void> {
    this.journals.delete(id);
  }

  // Updated Entity methods to include userId
  async getEntities(type?: string, userId?: number): Promise<Entity[]> {
    let entities = Array.from(this.entities.values());
    if (userId) {
      entities = entities.filter(e => e.userId === userId);
    }
    if (type) {
      entities = entities.filter(e => e.type === type);
    }
    return entities;
  }

  async getEntity(id: number): Promise<Entity | undefined> {
    return this.entities.get(id);
  }

  async createEntity(entity: InsertEntity & { userId: number }): Promise<Entity> {
    const id = this.entityId++;
    const newEntity: Entity = {
      ...entity,
      id,
      created: new Date(),
    };
    this.entities.set(id, newEntity);
    return newEntity;
  }

  async updateEntity(id: number, entity: Partial<InsertEntity>): Promise<Entity> {
    const existing = await this.getEntity(id);
    if (!existing) throw new Error("Entity not found");

    const updated: Entity = {
      ...existing,
      ...entity,
    };
    this.entities.set(id, updated);
    return updated;
  }

  async deleteEntity(id: number): Promise<void> {
    this.entities.delete(id);
  }
}

export const storage = new MemStorage();