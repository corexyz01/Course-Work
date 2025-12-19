import { ChangeRequest } from "../models/ChangeRequest";
import { Employee } from "../models/Employee";
import { TimeEntry } from "../models/TimeEntry";
import { ForbiddenError, ValidationError } from "../models/errors";
import { DateTime } from "../lib/datetime";
import { IdGenerator } from "../lib/id";
import { ChangeRequestRepository } from "../repositories/ChangeRequestRepository";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { TimeEntryRepository } from "../repositories/TimeEntryRepository";

export class RequestService {
  private readonly reqRepo: ChangeRequestRepository;
  private readonly empRepo: EmployeeRepository;
  private readonly timeRepo: TimeEntryRepository;

  constructor(input?: { reqRepo?: ChangeRequestRepository; empRepo?: EmployeeRepository; timeRepo?: TimeEntryRepository }) {
    this.reqRepo = input?.reqRepo ?? new ChangeRequestRepository();
    this.empRepo = input?.empRepo ?? new EmployeeRepository();
    this.timeRepo = input?.timeRepo ?? new TimeEntryRepository();
  }

  public async createRequest(input: {
    employeeId: string;
    type: "timeCorrection" | "vacation" | "sickLeave" | "dayOff" | "businessTrip";
    payload: { date?: string; timeEntryId?: string; startTime?: string; endTime?: string; description?: string; days?: number };
  }): Promise<ChangeRequest> {
    const req = ChangeRequest.createNew({
      id: IdGenerator.newId(),
      employeeId: input.employeeId,
      type: input.type,
      payload: input.payload,
    });

    await this.reqRepo.create(req.toDTO());
    return req;
  }

  public async listForEmployee(employeeId: string): Promise<ChangeRequest[]> {
    const dtos = await this.reqRepo.listByEmployee(employeeId);
    return dtos.map((d) => ChangeRequest.fromDTO(d)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async listPending(): Promise<ChangeRequest[]> {
    const dtos = await this.reqRepo.listPending();
    return dtos.map((d) => ChangeRequest.fromDTO(d)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async review(input: {
    reviewerUserId: string;
    reviewerRole: "admin" | "employee";
    requestId: string;
    action: "approve" | "reject";
    reviewComment?: string;
  }): Promise<ChangeRequest> {
    if (input.reviewerRole !== "admin") throw new ForbiddenError("Only admin can review requests");

    const updatedDto = await this.reqRepo.update(input.requestId, (current) => {
      const model = ChangeRequest.fromDTO(current);
      if (input.action === "approve") {
        return model.approve({ reviewerId: input.reviewerUserId, reviewComment: input.reviewComment }).toDTO();
      }
      return model.reject({ reviewerId: input.reviewerUserId, reviewComment: input.reviewComment }).toDTO();
    });

    const updated = ChangeRequest.fromDTO(updatedDto);

    if (updated.status === "approved") {
      await this.applyApprovedRequest(updated);
    }

    return updated;
  }

  private async applyApprovedRequest(req: ChangeRequest): Promise<void> {
    if (req.type !== "timeCorrection") return;

    const date = req.payload.date;
    if (!date) return;

    const startTime = req.payload.startTime;
    const endTime = req.payload.endTime;
    if (!startTime || !endTime) throw new ValidationError("startTime and endTime required for correction");

    const startAt = DateTime.fromDateAndHHMM(date, startTime);
    const endAt = DateTime.fromDateAndHHMM(date, endTime);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) throw new ValidationError("Invalid time");

    const durationSeconds = DateTime.secondsBetween(startAt, endAt);

    const timeEntryId = req.payload.timeEntryId?.trim() || null;

    if (timeEntryId) {
      const existing = await this.timeRepo.getById(timeEntryId);
      if (existing.employeeId !== req.employeeId) throw new ForbiddenError("Time entry not owned by employee");

      await this.timeRepo.update(timeEntryId, (current) => {
        const model = TimeEntry.fromDTO(current);
        const stopped = model.stop({ endAt, durationSeconds });
        return stopped.withStatus("approved").toDTO();
      });

      return;
    }

    const existingForDay = await this.timeRepo.listByDateRange({ employeeId: req.employeeId, from: date, to: date });
    const target = existingForDay[0] ?? null;

    if (!target) {
      const entry = TimeEntry.startNew({
        id: IdGenerator.newId(),
        employeeId: req.employeeId,
        date,
        startAt,
        source: "manual",
      }).stop({ endAt, durationSeconds });

      await this.timeRepo.create(entry.withStatus("approved").toDTO());
      return;
    }

    await this.timeRepo.update(target.id, (current) => {
      const model = TimeEntry.fromDTO(current);
      const stopped = model.stop({ endAt, durationSeconds });
      return stopped.withStatus("approved").toDTO();
    });
  }

  public async getEmployee(employeeId: string): Promise<Employee> {
    const dto = await this.empRepo.getById(employeeId);
    return Employee.fromDTO(dto);
  }
}
