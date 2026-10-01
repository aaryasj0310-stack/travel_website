const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

const MESSAGES = {
  SUCCESS: 'Request completed successfully.',
  HEALTH_OK: 'API is running.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_FAILED: 'Validation failed.',
  UNAUTHORIZED: 'Authentication is required.',
  DATABASE_ERROR: 'Database operation failed.',
  INTERNAL_SERVER_ERROR: 'Internal server error.'
};

const APP = {
  API_PREFIX: '/api/v1',
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
};

const TRIP_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed'
};

module.exports = {
  HTTP_STATUS,
  MESSAGES,
  APP,
  TRIP_STATUS
};
