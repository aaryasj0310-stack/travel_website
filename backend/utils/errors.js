const { HTTP_STATUS, MESSAGES } = require('./constants');

class AppError extends Error {
  constructor(
    message = MESSAGES.INTERNAL_SERVER_ERROR,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors = []
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) ? errors : [errors];
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = MESSAGES.VALIDATION_FAILED, errors = []) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors);
  }
}

class NotFoundError extends AppError {
  constructor(message = MESSAGES.NOT_FOUND, errors = []) {
    super(message, HTTP_STATUS.NOT_FOUND, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = MESSAGES.UNAUTHORIZED, errors = []) {
    super(message, HTTP_STATUS.UNAUTHORIZED, errors);
  }
}

class DatabaseError extends AppError {
  constructor(message = MESSAGES.DATABASE_ERROR, errors = []) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, errors);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  DatabaseError
};
