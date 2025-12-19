export type UserRole = "admin" | "employee";
export type UserStatus = "active" | "inactive";

export type EmploymentType = "fullTime" | "partTime";

export type TimeEntryType = "work" | "overtime" | "weekend" | "absence";
export type TimeEntrySource = "timer" | "manual";
export type TimeEntryStatus = "draft" | "approved" | "pendingChange";

export type ChangeRequestType = "timeCorrection" | "vacation" | "sickLeave" | "dayOff" | "businessTrip";
export type ChangeRequestStatus = "pending" | "approved" | "rejected";
