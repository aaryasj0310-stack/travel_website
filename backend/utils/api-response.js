const { HTTP_STATUS, MESSAGES } = require('./constants');

const sendSuccess = (
  res,
  {
    statusCode = HTTP_STATUS.OK,
    message = MESSAGES.SUCCESS,
    data = {}
  } = {}
) => res.status(statusCode).json({
  success: true,
  message,
  data
});

const sendError = (
  res,
  {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message = MESSAGES.INTERNAL_SERVER_ERROR,
    errors = []
  } = {}
) => res.status(statusCode).json({
  success: false,
  message,
  errors
});

module.exports = {
  sendSuccess,
  sendError
};
