import type { EmploymentType } from "./types";
import { ValidationError } from "./errors";
import { WorkSchedule, type WorkScheduleDTO } from "./WorkSchedule";

export type EmployeeDTO = {
  id: string;
  userId: string;
  standardHoursPerDay: number;
  employmentType: EmploymentType;
  workSchedule: WorkScheduleDTO;
  createdAt: string;
  updatedAt: string;
};

export class Employee {
  public readonly id: string;
  public readonly userId: string;
  public readonly standardHoursPerDay: number;
  public readonly employmentType: EmploymentType;
  public readonly workSchedule: WorkSchedule;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: {
    id: string;
    userId: string;
    standardHoursPerDay: number;
    employmentType: EmploymentType;
    workSchedule: WorkSchedule;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.standardHoursPerDay = props.standardHoursPerDay;
    this.employmentType = props.employmentType;
    this.workSchedule = props.workSchedule;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static createNew(input: {
    id: string;
    userId: string;
    standardHoursPerDay: number;
    employmentType: EmploymentType;
    workSchedule?: WorkSchedule;
    now?: Date;
  }): Employee {
    const now = input.now ?? new Date();
    Employee.assertHours(input.standardHoursPerDay);

    return new Employee({
      id: input.id,
      userId: input.userId,
      standardHoursPerDay: input.standardHoursPerDay,
      employmentType: input.employmentType,
      workSchedule: input.workSchedule ?? WorkSchedule.standard(),
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromDTO(dto: EmployeeDTO): Employee {
    Employee.assertHours(dto.standardHoursPerDay);
    return new Employee({
      id: dto.id,
      userId: dto.userId,
      standardHoursPerDay: dto.standardHoursPerDay,
      employmentType: dto.employmentType,
      workSchedule: WorkSchedule.fromDTO(dto.workSchedule),
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
  }

  public toDTO(): EmployeeDTO {
    return {
      id: this.id,
      userId: this.userId,
      standardHoursPerDay: this.standardHoursPerDay,
      employmentType: this.employmentType,
      workSchedule: this.workSchedule.toDTO(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public withSchedule(workSchedule: WorkSchedule, now?: Date): Employee {
    return new Employee({ ...this, workSchedule, updatedAt: now ?? new Date() });
  }

  private static assertHours(hours: number): void {
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
      throw new ValidationError("Invalid standard hours per day");
    }
  }
}
