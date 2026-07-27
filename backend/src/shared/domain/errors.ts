export class DomainError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" was not found`, 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string) {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictError";
  }
}
