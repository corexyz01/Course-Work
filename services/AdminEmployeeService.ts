import { ForbiddenError } from "../models/errors";
import { ChangeRequestRepository } from "../repositories/ChangeRequestRepository";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { TimeEntryRepository } from "../repositories/TimeEntryRepository";
import { UserRepository } from "../repositories/UserRepository";

export class AdminEmployeeService {
  private readonly empRepo: EmployeeRepository;
  private readonly userRepo: UserRepository;
  private readonly timeRepo: TimeEntryRepository;
  private readonly reqRepo: ChangeRequestRepository;

  constructor(input?: {
    empRepo?: EmployeeRepository;
    userRepo?: UserRepository;
    timeRepo?: TimeEntryRepository;
    reqRepo?: ChangeRequestRepository;
  }) {
    this.empRepo = input?.empRepo ?? new EmployeeRepository();
    this.userRepo = input?.userRepo ?? new UserRepository();
    this.timeRepo = input?.timeRepo ?? new TimeEntryRepository();
    this.reqRepo = input?.reqRepo ?? new ChangeRequestRepository();
  }

  public async deleteEmployeeCascade(input: { actorRole: "admin" | "employee"; employeeId: string }): Promise<void> {
    if (input.actorRole !== "admin") throw new ForbiddenError("Only admin can delete employees");

    const employee = await this.empRepo.getById(input.employeeId);

    const [timeEntries, requests] = await Promise.all([
      this.timeRepo.listByEmployee(employee.id),
      this.reqRepo.listByEmployee(employee.id),
    ]);

    for (const te of timeEntries) {
      await this.timeRepo.delete(te.id);
    }

    for (const r of requests) {
      await this.reqRepo.delete(r.id);
    }

    await this.empRepo.delete(employee.id);
    await this.userRepo.delete(employee.userId);
  }
}
