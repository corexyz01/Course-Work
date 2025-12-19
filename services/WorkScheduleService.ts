import { Employee } from "../models/Employee";
import { WorkSchedule, type DayOfWeek } from "../models/WorkSchedule";
import { DateRange } from "../lib/dateRange";

export class WorkScheduleService {
  public plannedMinutes(employee: Employee, fromISO: string, toISO: string): number {
    const dates = DateRange.listISO(fromISO, toISO);
    let total = 0;
    for (const iso of dates) {
      if (!this.isWorkDay(employee.workSchedule, iso)) continue;
      total += Math.round(employee.standardHoursPerDay * 60);
    }
    return total;
  }

  public isLate(employee: Employee, isoDate: string, startTimeHHMM: string): boolean {
    const day = this.dayOfWeekISO(isoDate);
    const rule = employee.workSchedule.getDay(day);
    if (!rule.enabled) return false;
    return rule.start !== "" && startTimeHHMM > rule.start;
  }

  public expectedStart(employee: Employee, isoDate: string): string | null {
    const day = this.dayOfWeekISO(isoDate);
    const rule = employee.workSchedule.getDay(day);
    if (!rule.enabled) return null;
    return rule.start || null;
  }

  public isWorkDay(schedule: WorkSchedule, isoDate: string): boolean {
    const day = this.dayOfWeekISO(isoDate);
    return schedule.getDay(day).enabled;
  }

  private dayOfWeekISO(isoDate: string): DayOfWeek {
    const d = new Date(`${isoDate}T00:00:00`);
    const day = d.getDay();
    if (day === 0) return "sun";
    if (day === 1) return "mon";
    if (day === 2) return "tue";
    if (day === 3) return "wed";
    if (day === 4) return "thu";
    if (day === 5) return "fri";
    return "sat";
  }
}
