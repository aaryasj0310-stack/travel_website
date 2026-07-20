const { sendError } = require('../utils/api-response');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

const notFound = (req, res, next) => {
  sendError(res, {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: MESSAGES.NOT_FOUND,
    errors: []
  });
};

module.exports = notFound;
