import { ValidationError } from "./errors";

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type WorkDayScheduleDTO = {
  start: string;
  end: string;
  enabled: boolean;
};

export type WorkScheduleDTO = {
  mon: WorkDayScheduleDTO;
  tue: WorkDayScheduleDTO;
  wed: WorkDayScheduleDTO;
  thu: WorkDayScheduleDTO;
  fri: WorkDayScheduleDTO;
  sat: WorkDayScheduleDTO;
  sun: WorkDayScheduleDTO;
};

export class WorkSchedule {
  public readonly mon: WorkDayScheduleDTO;
  public readonly tue: WorkDayScheduleDTO;
  public readonly wed: WorkDayScheduleDTO;
  public readonly thu: WorkDayScheduleDTO;
  public readonly fri: WorkDayScheduleDTO;
  public readonly sat: WorkDayScheduleDTO;
  public readonly sun: WorkDayScheduleDTO;

  private constructor(dto: WorkScheduleDTO) {
    this.mon = dto.mon;
    this.tue = dto.tue;
    this.wed = dto.wed;
    this.thu = dto.thu;
    this.fri = dto.fri;
    this.sat = dto.sat;
    this.sun = dto.sun;
  }

  public static standard(): WorkSchedule {
    return new WorkSchedule({
      mon: { enabled: true, start: "09:00", end: "18:00" },
      tue: { enabled: true, start: "09:00", end: "18:00" },
      wed: { enabled: true, start: "09:00", end: "18:00" },
      thu: { enabled: true, start: "09:00", end: "18:00" },
      fri: { enabled: true, start: "09:00", end: "18:00" },
      sat: { enabled: false, start: "", end: "" },
      sun: { enabled: false, start: "", end: "" },
    });
  }

  public static fromDTO(dto: WorkScheduleDTO): WorkSchedule {
    WorkSchedule.assert(dto);
    return new WorkSchedule(dto);
  }

  public toDTO(): WorkScheduleDTO {
    return {
      mon: this.mon,
      tue: this.tue,
      wed: this.wed,
      thu: this.thu,
      fri: this.fri,
      sat: this.sat,
      sun: this.sun,
    };
  }

  public getDay(day: DayOfWeek): WorkDayScheduleDTO {
    return this[day];
  }

  private static assert(dto: WorkScheduleDTO): void {
    const days: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    for (const d of days) {
      const day = dto[d];
      if (!day) throw new ValidationError("Invalid work schedule");
      if (!day.enabled) continue;
      if (!/^\d{2}:\d{2}$/.test(day.start) || !/^\d{2}:\d{2}$/.test(day.end)) {
        throw new ValidationError("Invalid work schedule time format");
      }
    }
  }
}
