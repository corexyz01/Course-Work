import { JsonFileStore } from "./JsonFileStore";
import { NotFoundError } from "../models/errors";

export abstract class BaseRepository<T extends { id: string }> {
  protected readonly store: JsonFileStore<T>;

  protected constructor(relativePath: string) {
    this.store = new JsonFileStore<T>(relativePath);
  }

  public async list(): Promise<T[]> {
    return await this.store.readAll();
  }

  public async getById(id: string): Promise<T> {
    const items = await this.store.readAll();
    const found = items.find((x) => x.id === id);
    if (!found) throw new NotFoundError("Item not found");
    return found;
  }

  public async findOne(predicate: (item: T) => boolean): Promise<T | null> {
    const items = await this.store.readAll();
    return items.find(predicate) ?? null;
  }

  public async create(item: T): Promise<T> {
    const items = await this.store.readAll();
    items.push(item);
    await this.store.writeAll(items);
    return item;
  }

  public async update(id: string, updater: (current: T) => T): Promise<T> {
    const items = await this.store.readAll();
    const idx = items.findIndex((x) => x.id === id);
    if (idx === -1) throw new NotFoundError("Item not found");
    const updated = updater(items[idx]);
    items[idx] = updated;
    await this.store.writeAll(items);
    return updated;
  }

  public async delete(id: string): Promise<void> {
    const items = await this.store.readAll();
    const next = items.filter((x) => x.id !== id);
    if (next.length === items.length) throw new NotFoundError("Item not found");
    await this.store.writeAll(next);
  }
}
