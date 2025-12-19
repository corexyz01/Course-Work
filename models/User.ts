import { ValidationError } from "./errors";
import type { UserRole, UserStatus } from "./types";

export type UserDTO = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  position: string;
  department: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly role: UserRole;
  public readonly fullName: string;
  public readonly position: string;
  public readonly department: string;
  public readonly status: UserStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    fullName: string;
    position: string;
    department: string;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.fullName = props.fullName;
    this.position = props.position;
    this.department = props.department;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static createNew(input: {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    fullName: string;
    position: string;
    department: string;
    status?: UserStatus;
    now?: Date;
  }): User {
    const now = input.now ?? new Date();
    User.assertEmail(input.email);

    return new User({
      id: input.id,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role,
      fullName: input.fullName.trim(),
      position: input.position.trim(),
      department: input.department.trim(),
      status: input.status ?? "active",
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromDTO(dto: UserDTO): User {
    User.assertEmail(dto.email);

    return new User({
      id: dto.id,
      email: dto.email.toLowerCase(),
      passwordHash: dto.passwordHash,
      role: dto.role,
      fullName: dto.fullName,
      position: dto.position,
      department: dto.department,
      status: dto.status,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  public toDTO(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      role: this.role,
      fullName: this.fullName,
      position: this.position,
      department: this.department,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public withProfileUpdate(input: {
    fullName: string;
    position: string;
    department: string;
    status: UserStatus;
    now?: Date;
  }): User {
    const now = input.now ?? new Date();
    return new User({
      ...this,
      fullName: input.fullName.trim(),
      position: input.position.trim(),
      department: input.department.trim(),
      status: input.status,
      updatedAt: now,
    });
  }

  public withPasswordHash(passwordHash: string, now?: Date): User {
    return new User({ ...this, passwordHash, updatedAt: now ?? new Date() });
  }

  public isActive(): boolean {
    return this.status === "active";
  }

  private static assertEmail(email: string): void {
    const normalized = email.trim().toLowerCase();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    if (!ok) throw new ValidationError("Invalid email");
  }
}
