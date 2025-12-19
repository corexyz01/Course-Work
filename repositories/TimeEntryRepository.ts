import { BaseRepository } from "./BaseRepository";
import type { TimeEntryDTO } from "../models/TimeEntry";

export class TimeEntryRepository extends BaseRepository<TimeEntryDTO> {
  constructor() {
    super("data/timeEntries.json");
  }

  public async listByEmployee(employeeId: string): Promise<TimeEntryDTO[]> {
    const items = await this.list();
    return items.filter((x) => x.employeeId === employeeId);
  }

  public async findRunningByEmployee(employeeId: string): Promise<TimeEntryDTO | null> {
    const items = await this.listByEmployee(employeeId);
    return items.find((x) => x.endAt === null) ?? null;
  }

  public async listByDateRange(input: { employeeId?: string; from: string; to: string }): Promise<TimeEntryDTO[]> {
    const items = await this.list();
    return items.filter((x) => {
      if (input.employeeId && x.employeeId !== input.employeeId) return false;
      return x.date >= input.from && x.date <= input.to;
    });
  }
}
