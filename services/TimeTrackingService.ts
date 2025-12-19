import { Employee } from "../models/Employee";
import { TimeEntry } from "../models/TimeEntry";
import { ValidationError } from "../models/errors";
import { DateTime } from "../lib/datetime";
import { IdGenerator } from "../lib/id";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { TimeEntryRepository } from "../repositories/TimeEntryRepository";

export type TimesheetRow = {
  date: string;
  startAt: string | null;
  endAt: string | null;
  durationSeconds: number;
  status: "draft" | "approved" | "pendingChange";
};

export type TimesheetSummary = {
  from: string;
  to: string;
  totalSeconds: number;
  rows: TimesheetRow[];
};

export class TimeTrackingService {
  private readonly employeeRepo: EmployeeRepository;
  private readonly timeRepo: TimeEntryRepository;

  constructor(input?: { employeeRepo?: EmployeeRepository; timeRepo?: TimeEntryRepository }) {
    this.employeeRepo = input?.employeeRepo ?? new EmployeeRepository();
    this.timeRepo = input?.timeRepo ?? new TimeEntryRepository();
  }

  public async startWork(userEmployeeId: string, now?: Date): Promise<TimeEntry> {
    const running = await this.timeRepo.findRunningByEmployee(userEmployeeId);
    if (running) throw new ValidationError("Work already started");

    const d = now ?? new Date();
    const entry = TimeEntry.startNew({
      id: IdGenerator.newId(),
      employeeId: userEmployeeId,
      date: DateTime.toISODate(d),
      startAt: d,
      source: "timer",
    });

    await this.timeRepo.create(entry.toDTO());
    return entry;
  }

  public async stopWork(userEmployeeId: string, now?: Date): Promise<TimeEntry> {
    const running = await this.timeRepo.findRunningByEmployee(userEmployeeId);
    if (!running) throw new ValidationError("No active timer");

    const d = now ?? new Date();
    const startAt = new Date(running.startAt);
    const durationSeconds = DateTime.secondsBetween(startAt, d);

    const updated = await this.timeRepo.update(running.id, (current) => {
      const model = TimeEntry.fromDTO(current);
      return model.stop({ endAt: d, durationSeconds }).toDTO();
    });

    return TimeEntry.fromDTO(updated);
  }

  public async getTimesheet(input: { employeeId: string; from: string; to: string }): Promise<TimesheetSummary> {
    const rows = await this.timeRepo.listByDateRange({ employeeId: input.employeeId, from: input.from, to: input.to });
    const sorted = rows.sort((a, b) => a.date.localeCompare(b.date));
    const mapped: TimesheetRow[] = sorted.map((r) => ({
      date: r.date,
      startAt: r.startAt,
      endAt: r.endAt,
      durationSeconds: r.durationSeconds,
      status: r.status,
    }));
    const totalSeconds = mapped.reduce((s, r) => s + r.durationSeconds, 0);
    return { from: input.from, to: input.to, totalSeconds, rows: mapped };
  }

  public async getEmployeeByUserId(userId: string): Promise<Employee> {
    const dto = await this.employeeRepo.getByUserId(userId);
    if (!dto) throw new ValidationError("Employee profile not found");
    return Employee.fromDTO(dto);
  }
}
