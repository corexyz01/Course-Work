import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Employee } from "../models/Employee";
import { UnauthorizedError, ValidationError } from "../models/errors";
import { IdGenerator } from "../lib/id";
import { UserRepository } from "../repositories/UserRepository";
import { EmployeeRepository } from "../repositories/EmployeeRepository";

export type AuthTokenPayload = {
  userId: string;
  role: "admin" | "employee";
};

export class AuthService {
  private readonly userRepo: UserRepository;
  private readonly employeeRepo: EmployeeRepository;
  private readonly jwtSecret: string;

  constructor(input?: { userRepo?: UserRepository; employeeRepo?: EmployeeRepository; jwtSecret?: string }) {
    this.userRepo = input?.userRepo ?? new UserRepository();
    this.employeeRepo = input?.employeeRepo ?? new EmployeeRepository();
    this.jwtSecret = input?.jwtSecret ?? (process.env.AUTH_JWT_SECRET ?? "dev_secret_change_me");
  }

  public async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const found = await this.userRepo.getByEmail(email);
    if (!found) throw new UnauthorizedError("Invalid credentials");
    const user = User.fromDTO(found);
    if (!user.isActive()) throw new UnauthorizedError("User inactive");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedError("Invalid credentials");

    const token = this.signToken({ userId: user.id, role: user.role });
    return { token, user };
  }

  public async registerAdminIfEmpty(input: {
    email: string;
    password: string;
    fullName: string;
    position: string;
    department: string;
  }): Promise<User> {
    const existing = await this.userRepo.list();
    if (existing.length > 0) throw new ValidationError("Users already exist");

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = User.createNew({
      id: IdGenerator.newId(),
      email: input.email,
      passwordHash,
      role: "admin",
      fullName: input.fullName,
      position: input.position,
      department: input.department,
    });

    await this.userRepo.create(user.toDTO());
    return user;
  }

  public async createEmployeeUser(input: {
    email: string;
    password: string;
    fullName: string;
    position: string;
    department: string;
    standardHoursPerDay: number;
    employmentType: "fullTime" | "partTime";
  }): Promise<{ user: User; employee: Employee }> {
    const exists = await this.userRepo.getByEmail(input.email);
    if (exists) throw new ValidationError("Email already in use");

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = User.createNew({
      id: IdGenerator.newId(),
      email: input.email,
      passwordHash,
      role: "employee",
      fullName: input.fullName,
      position: input.position,
      department: input.department,
    });

    const employee = Employee.createNew({
      id: IdGenerator.newId(),
      userId: user.id,
      standardHoursPerDay: input.standardHoursPerDay,
      employmentType: input.employmentType,
    });

    await this.userRepo.create(user.toDTO());
    await this.employeeRepo.create(employee.toDTO());

    return { user, employee };
  }

  public verifyToken(token: string): AuthTokenPayload {
    const decoded = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
    const userId = decoded.userId;
    const role = decoded.role;
    if (typeof userId !== "string" || (role !== "admin" && role !== "employee")) {
      throw new UnauthorizedError("Invalid token");
    }
    return { userId, role };
  }

  public async getCurrentUser(token: string): Promise<User> {
    const payload = this.verifyToken(token);
    const dto = await this.userRepo.getById(payload.userId);
    const user = User.fromDTO(dto);
    if (!user.isActive()) throw new UnauthorizedError("User inactive");
    return user;
  }

  private signToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: "7d" });
  }
}
