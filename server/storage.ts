import { Journal, Entity, InsertJournal, InsertEntity } from "@shared/schema";

export interface IStorage {
  // Journals
  getJournals(): Promise<Journal[]>;
  getJournal(id: number): Promise<Journal | undefined>;
  createJournal(journal: InsertJournal): Promise<Journal>;
  updateJournal(id: number, journal: Partial<InsertJournal>): Promise<Journal>;
  deleteJournal(id: number): Promise<void>;
  
  // Entities
  getEntities(type?: string): Promise<Entity[]>;
  getEntity(id: number): Promise<Entity | undefined>;
  createEntity(entity: InsertEntity): Promise<Entity>;
  updateEntity(id: number, entity: Partial<InsertEntity>): Promise<Entity>;
  deleteEntity(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private journals: Map<number, Journal>;
  private entities: Map<number, Entity>;
  private journalId: number;
  private entityId: number;

  constructor() {
    this.journals = new Map();
    this.entities = new Map();
    this.journalId = 1;
    this.entityId = 1;
  }

  async getJournals(): Promise<Journal[]> {
    return Array.from(this.journals.values());
  }

  async getJournal(id: number): Promise<Journal | undefined> {
    return this.journals.get(id);
  }

  async createJournal(journal: InsertJournal): Promise<Journal> {
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

  async getEntities(type?: string): Promise<Entity[]> {
    const entities = Array.from(this.entities.values());
    return type ? entities.filter(e => e.type === type) : entities;
  }

  async getEntity(id: number): Promise<Entity | undefined> {
    return this.entities.get(id);
  }

  async createEntity(entity: InsertEntity): Promise<Entity> {
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
