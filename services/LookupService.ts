import { IdGenerator } from "../lib/id";
import { LookupItem } from "../models/LookupItem";
import { ValidationError } from "../models/errors";
import { LookupRepository } from "../repositories/LookupRepository";

export class LookupService {
  private readonly depRepo: LookupRepository;
  private readonly posRepo: LookupRepository;

  constructor(input?: { depRepo?: LookupRepository; posRepo?: LookupRepository }) {
    this.depRepo = input?.depRepo ?? new LookupRepository("data/departments.json");
    this.posRepo = input?.posRepo ?? new LookupRepository("data/positions.json");
  }

  public async list(): Promise<{ departments: LookupItem[]; positions: LookupItem[] }> {
    const [deps, pos] = await Promise.all([this.depRepo.listSorted(), this.posRepo.listSorted()]);
    return {
      departments: deps.map(LookupItem.fromDTO),
      positions: pos.map(LookupItem.fromDTO),
    };
  }

  public async addDepartment(name: string): Promise<LookupItem> {
    const existing = await this.depRepo.findByName(name);
    if (existing) throw new ValidationError("Department already exists");
    const item = LookupItem.createNew({ id: IdGenerator.newId(), name });
    await this.depRepo.create(item.toDTO());
    return item;
  }

  public async addPosition(name: string): Promise<LookupItem> {
    const existing = await this.posRepo.findByName(name);
    if (existing) throw new ValidationError("Position already exists");
    const item = LookupItem.createNew({ id: IdGenerator.newId(), name });
    await this.posRepo.create(item.toDTO());
    return item;
  }
}
