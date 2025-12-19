import type { ChangeRequestStatus, ChangeRequestType } from "./types";
import { ValidationError } from "./errors";

export type ChangeRequestPayload = {
  date?: string;
  timeEntryId?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  days?: number;
};

export type ChangeRequestDTO = {
  id: string;
  employeeId: string;
  type: ChangeRequestType;
  payload: ChangeRequestPayload;
  createdAt: string;
  status: ChangeRequestStatus;
  reviewerId: string | null;
  reviewComment: string | null;
  reviewedAt: string | null;
};

export class ChangeRequest {
  public readonly id: string;
  public readonly employeeId: string;
  public readonly type: ChangeRequestType;
  public readonly payload: ChangeRequestPayload;
  public readonly createdAt: Date;
  public readonly status: ChangeRequestStatus;
  public readonly reviewerId: string | null;
  public readonly reviewComment: string | null;
  public readonly reviewedAt: Date | null;

  private constructor(props: {
    id: string;
    employeeId: string;
    type: ChangeRequestType;
    payload: ChangeRequestPayload;
    createdAt: Date;
    status: ChangeRequestStatus;
    reviewerId: string | null;
    reviewComment: string | null;
    reviewedAt: Date | null;
  }) {
    this.id = props.id;
    this.employeeId = props.employeeId;
    this.type = props.type;
    this.payload = props.payload;
    this.createdAt = props.createdAt;
    this.status = props.status;
    this.reviewerId = props.reviewerId;
    this.reviewComment = props.reviewComment;
    this.reviewedAt = props.reviewedAt;
  }

  public static createNew(input: {
    id: string;
    employeeId: string;
    type: ChangeRequestType;
    payload: ChangeRequestPayload;
    now?: Date;
  }): ChangeRequest {
    ChangeRequest.assertPayload(input.type, input.payload);

    return new ChangeRequest({
      id: input.id,
      employeeId: input.employeeId,
      type: input.type,
      payload: input.payload,
      createdAt: input.now ?? new Date(),
      status: "pending",
      reviewerId: null,
      reviewComment: null,
      reviewedAt: null,
    });
  }

  public static fromDTO(dto: ChangeRequestDTO): ChangeRequest {
    ChangeRequest.assertPayload(dto.type, dto.payload);

    return new ChangeRequest({
      id: dto.id,
      employeeId: dto.employeeId,
      type: dto.type,
      payload: dto.payload,
      createdAt: new Date(dto.createdAt),
      status: dto.status,
      reviewerId: dto.reviewerId,
      reviewComment: dto.reviewComment,
      reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : null,
    });
  }

  public toDTO(): ChangeRequestDTO {
    return {
      id: this.id,
      employeeId: this.employeeId,
      type: this.type,
      payload: this.payload,
      createdAt: this.createdAt.toISOString(),
      status: this.status,
      reviewerId: this.reviewerId,
      reviewComment: this.reviewComment,
      reviewedAt: this.reviewedAt ? this.reviewedAt.toISOString() : null,
    };
  }

  public approve(input: { reviewerId: string; reviewComment?: string; now?: Date }): ChangeRequest {
    if (this.status !== "pending") throw new ValidationError("Request already reviewed");

    return new ChangeRequest({
      ...this,
      status: "approved",
      reviewerId: input.reviewerId,
      reviewComment: input.reviewComment ?? null,
      reviewedAt: input.now ?? new Date(),
    });
  }

  public reject(input: { reviewerId: string; reviewComment?: string; now?: Date }): ChangeRequest {
    if (this.status !== "pending") throw new ValidationError("Request already reviewed");

    return new ChangeRequest({
      ...this,
      status: "rejected",
      reviewerId: input.reviewerId,
      reviewComment: input.reviewComment ?? null,
      reviewedAt: input.now ?? new Date(),
    });
  }

  private static assertPayload(type: ChangeRequestType, payload: ChangeRequestPayload): void {
    if (type === "timeCorrection") {
      if (!payload.date) throw new ValidationError("Date required");
      if (payload.timeEntryId && payload.timeEntryId.trim().length < 8) throw new ValidationError("Invalid timeEntryId");
      if (payload.startTime && !/^\d{2}:\d{2}$/.test(payload.startTime)) throw new ValidationError("Invalid startTime");
      if (payload.endTime && !/^\d{2}:\d{2}$/.test(payload.endTime)) throw new ValidationError("Invalid endTime");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) throw new ValidationError("Invalid date");
      return;
    }

    if (type === "vacation" || type === "sickLeave" || type === "dayOff" || type === "businessTrip") {
      if (!payload.date) throw new ValidationError("Date required");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) throw new ValidationError("Invalid date");
      return;
    }
  }
}
