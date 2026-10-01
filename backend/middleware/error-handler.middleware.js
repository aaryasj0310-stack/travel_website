const env = require('../config/env');
const { sendError } = require('../utils/api-response');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isServerError = statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = isServerError ? MESSAGES.INTERNAL_SERVER_ERROR : err.message;

  if (env.nodeEnv !== 'test') {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);
  }

  sendError(res, {
    statusCode,
    message,
    errors: isServerError ? [] : err.errors || []
  });
};

module.exports = errorHandler;
