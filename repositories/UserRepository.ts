import { BaseRepository } from "./BaseRepository";
import type { UserDTO } from "../models/User";

export class UserRepository extends BaseRepository<UserDTO> {
  constructor() {
    super("data/users.json");
  }

  public async getByEmail(email: string): Promise<UserDTO | null> {
    const normalized = email.trim().toLowerCase();
    return await this.findOne((u) => u.email.toLowerCase() === normalized);
  }
}
