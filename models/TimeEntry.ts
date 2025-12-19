import { ValidationError } from "./errors";
import type { TimeEntrySource, TimeEntryStatus, TimeEntryType } from "./types";

export type TimeEntryDTO = {
  id: string;
  employeeId: string;
  date: string;
  startAt: string;
  endAt: string | null;
  durationSeconds: number;
  type: TimeEntryType;
  source: TimeEntrySource;
  status: TimeEntryStatus;
  createdAt: string;
  updatedAt: string;
};

export class TimeEntry {
  public readonly id: string;
  public readonly employeeId: string;
  public readonly date: string;
  public readonly startAt: Date;
  public readonly endAt: Date | null;
  public readonly durationSeconds: number;
  public readonly type: TimeEntryType;
  public readonly source: TimeEntrySource;
  public readonly status: TimeEntryStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: {
    id: string;
    employeeId: string;
    date: string;
    startAt: Date;
    endAt: Date | null;
    durationSeconds: number;
    type: TimeEntryType;
    source: TimeEntrySource;
    status: TimeEntryStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.employeeId = props.employeeId;
    this.date = props.date;
    this.startAt = props.startAt;
    this.endAt = props.endAt;
    this.durationSeconds = props.durationSeconds;
    this.type = props.type;
    this.source = props.source;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static startNew(input: {
    id: string;
    employeeId: string;
    date: string;
    startAt: Date;
    type?: TimeEntryType;
    source?: TimeEntrySource;
    now?: Date;
  }): TimeEntry {
    TimeEntry.assertDate(input.date);
    const now = input.now ?? new Date();

    return new TimeEntry({
      id: input.id,
      employeeId: input.employeeId,
      date: input.date,
      startAt: input.startAt,
      endAt: null,
      durationSeconds: 0,
      type: input.type ?? "work",
      source: input.source ?? "timer",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromDTO(dto: TimeEntryDTO): TimeEntry {
    TimeEntry.assertDate(dto.date);
    TimeEntry.assertISO(dto.startAt);
    if (dto.endAt !== null) TimeEntry.assertISO(dto.endAt);
    if (!Number.isFinite(dto.durationSeconds) || dto.durationSeconds < 0) {
      throw new ValidationError("Invalid duration");
    }

    return new TimeEntry({
      id: dto.id,
      employeeId: dto.employeeId,
      date: dto.date,
      startAt: new Date(dto.startAt),
      endAt: dto.endAt ? new Date(dto.endAt) : null,
      durationSeconds: Math.round(dto.durationSeconds),
      type: dto.type,
      source: dto.source,
      status: dto.status,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  public toDTO(): TimeEntryDTO {
    return {
      id: this.id,
      employeeId: this.employeeId,
      date: this.date,
      startAt: this.startAt.toISOString(),
      endAt: this.endAt ? this.endAt.toISOString() : null,
      durationSeconds: this.durationSeconds,
      type: this.type,
      source: this.source,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public stop(input: { endAt: Date; durationSeconds: number; now?: Date }): TimeEntry {
    if (!Number.isFinite(input.durationSeconds) || input.durationSeconds < 0) {
      throw new ValidationError("Invalid duration");
    }

    return new TimeEntry({
      ...this,
      endAt: input.endAt,
      durationSeconds: Math.round(input.durationSeconds),
      updatedAt: input.now ?? new Date(),
    });
  }

  public withStatus(status: TimeEntryStatus, now?: Date): TimeEntry {
    return new TimeEntry({ ...this, status, updatedAt: now ?? new Date() });
  }

  public isRunning(): boolean {
    return this.endAt === null;
  }

  private static assertDate(date: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ValidationError("Invalid date");
  }

  private static assertISO(value: string): void {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) throw new ValidationError("Invalid datetime");
  }
}
