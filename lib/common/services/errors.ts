export class BaseError extends Error {
  constructor(error: unknown = {}) {
    super(JSON.stringify(error));
  }
}

export class PartialFailureError extends BaseError {}

export class NonRetriableError extends BaseError {}
