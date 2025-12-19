import { BaseRepository } from "./BaseRepository";
import type { LookupItemDTO } from "../models/LookupItem";

export class LookupRepository extends BaseRepository<LookupItemDTO> {
  constructor(relativePath: string) {
    super(relativePath);
  }

  public async listSorted(): Promise<LookupItemDTO[]> {
    const items = await this.list();
    return items.slice().sort((a, b) => a.name.localeCompare(b.name));
  }

  public async findByName(name: string): Promise<LookupItemDTO | null> {
    const normalized = name.trim().toLowerCase();
    return await this.findOne((x) => x.name.trim().toLowerCase() === normalized);
  }
}
