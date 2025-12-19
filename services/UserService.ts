import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { ForbiddenError, ValidationError } from "../models/errors";
import { IdGenerator } from "../lib/id";
import { UserRepository } from "../repositories/UserRepository";

export class UserService {
  private readonly repo: UserRepository;

  constructor(repo?: UserRepository) {
    this.repo = repo ?? new UserRepository();
  }

  public async listUsers(): Promise<User[]> {
    const dtos = await this.repo.list();
    return dtos.map((d) => User.fromDTO(d));
  }

  public async createUserAsAdmin(input: {
    email: string;
    password: string;
    role: "admin" | "employee";
    fullName: string;
    position: string;
    department: string;
  }): Promise<User> {
    const exists = await this.repo.getByEmail(input.email);
    if (exists) throw new ValidationError("Email already in use");

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = User.createNew({
      id: IdGenerator.newId(),
      email: input.email,
      passwordHash,
      role: input.role,
      fullName: input.fullName,
      position: input.position,
      department: input.department,
    });

    await this.repo.create(user.toDTO());
    return user;
  }

  public async updateUserAsAdmin(input: {
    userId: string;
    fullName: string;
    position: string;
    department: string;
    status: "active" | "inactive";
  }): Promise<User> {
    const updatedDto = await this.repo.update(input.userId, (current) => {
      const model = User.fromDTO(current);
      return model
        .withProfileUpdate({
          fullName: input.fullName,
          position: input.position,
          department: input.department,
          status: input.status,
        })
        .toDTO();
    });

    return User.fromDTO(updatedDto);
  }

  public async changePassword(input: {
    actorRole: "admin" | "employee";
    actorUserId: string;
    userId: string;
    newPassword: string;
  }): Promise<void> {
    if (input.actorRole !== "admin" && input.actorUserId !== input.userId) {
      throw new ForbiddenError("Cannot change password");
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await this.repo.update(input.userId, (current) => {
      const model = User.fromDTO(current);
      return model.withPasswordHash(passwordHash).toDTO();
    });
  }
}
