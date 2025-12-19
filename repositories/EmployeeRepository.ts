import { BaseRepository } from "./BaseRepository";
import type { EmployeeDTO } from "../models/Employee";

export class EmployeeRepository extends BaseRepository<EmployeeDTO> {
  constructor() {
    super("data/employees.json");
  }

  public async getByUserId(userId: string): Promise<EmployeeDTO | null> {
    return await this.findOne((e) => e.userId === userId);
  }
}
