import { BaseRepository } from "./BaseRepository";
import type { ChangeRequestDTO } from "../models/ChangeRequest";

export class ChangeRequestRepository extends BaseRepository<ChangeRequestDTO> {
  constructor() {
    super("data/changeRequests.json");
  }

  public async listByEmployee(employeeId: string): Promise<ChangeRequestDTO[]> {
    const items = await this.list();
    return items.filter((x) => x.employeeId === employeeId);
  }

  public async listPending(): Promise<ChangeRequestDTO[]> {
    const items = await this.list();
    return items.filter((x) => x.status === "pending");
  }
}
