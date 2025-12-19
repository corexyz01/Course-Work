import { Employee } from "../models/Employee";
import { User } from "../models/User";
import { WorkScheduleService } from "./WorkScheduleService";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { TimeEntryRepository } from "../repositories/TimeEntryRepository";
import { UserRepository } from "../repositories/UserRepository";
import { DateRange } from "../lib/dateRange";

export type EmployeeReportRow = {
  employeeId: string;
  userId: string;
  fullName: string;
  department: string;
  position: string;
  workedSeconds: number;
  plannedMinutes: number;
  deltaMinutes: number;
  lateDays: number;
  missingDays: number;
};

export type AdminReport = {
  from: string;
  to: string;
  totalWorkedSeconds: number;
  rows: EmployeeReportRow[];
};

export class ReportService {
  private readonly empRepo: EmployeeRepository;
  private readonly userRepo: UserRepository;
  private readonly timeRepo: TimeEntryRepository;
  private readonly scheduleService: WorkScheduleService;

  constructor(input?: {
    empRepo?: EmployeeRepository;
    userRepo?: UserRepository;
    timeRepo?: TimeEntryRepository;
    scheduleService?: WorkScheduleService;
  }) {
    this.empRepo = input?.empRepo ?? new EmployeeRepository();
    this.userRepo = input?.userRepo ?? new UserRepository();
    this.timeRepo = input?.timeRepo ?? new TimeEntryRepository();
    this.scheduleService = input?.scheduleService ?? new WorkScheduleService();
  }

  public async adminReport(from: string, to: string): Promise<AdminReport> {
    const [empsDto, usersDto, time] = await Promise.all([
      this.empRepo.list(),
      this.userRepo.list(),
      this.timeRepo.listByDateRange({ from, to }),
    ]);

    const users = new Map(usersDto.map((u) => [u.id, User.fromDTO(u)]));
    const entriesByEmployee = new Map<string, typeof time>();
    for (const e of time) {
      const list = entriesByEmployee.get(e.employeeId) ?? [];
      list.push(e);
      entriesByEmployee.set(e.employeeId, list);
    }

    const rows: EmployeeReportRow[] = [];

    for (const empDto of empsDto) {
      const emp = Employee.fromDTO(empDto);
      const user = users.get(emp.userId);
      if (!user) continue;
      const entries = (entriesByEmployee.get(emp.id) ?? []).sort((a, b) => a.date.localeCompare(b.date));

      const workedSeconds = entries.reduce((s, x) => s + x.durationSeconds, 0);
      const plannedMinutes = this.scheduleService.plannedMinutes(emp, from, to);
      const deltaMinutes = Math.round(workedSeconds / 60) - plannedMinutes;

      const dates = DateRange.listISO(from, to);
      const workDates = dates.filter((d) => this.scheduleService.isWorkDay(emp.workSchedule, d));
      const entryByDate = new Map(entries.map((e) => [e.date, e]));
      const missingDays = workDates.filter((d) => !entryByDate.has(d)).length;

      let lateDays = 0;
      for (const d of workDates) {
        const e = entryByDate.get(d);
        if (!e) continue;
        const start = new Date(e.startAt);
        const startHHMM = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
        if (this.scheduleService.isLate(emp, d, startHHMM)) lateDays += 1;
      }

      rows.push({
        employeeId: emp.id,
        userId: user.id,
        fullName: user.fullName,
        department: user.department,
        position: user.position,
        workedSeconds,
        plannedMinutes,
        deltaMinutes,
        lateDays,
        missingDays,
      });
    }

    const totalWorkedSeconds = rows.reduce((s, r) => s + r.workedSeconds, 0);

    rows.sort((a, b) => b.workedSeconds - a.workedSeconds);

    return { from, to, totalWorkedSeconds, rows };
  }
}
