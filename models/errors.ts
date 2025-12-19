export class DomainError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super("NOT_FOUND", message);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string) {
    super("FORBIDDEN", message);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string) {
    super("UNAUTHORIZED", message);
  }
}
