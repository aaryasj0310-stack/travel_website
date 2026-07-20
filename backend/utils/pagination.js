const { APP } = require('./constants');

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getPagination = (query = {}) => {
  const page = toPositiveInteger(query.page, APP.DEFAULT_PAGE);
  const requestedPageSize = toPositiveInteger(query.limit, APP.DEFAULT_PAGE_SIZE);
  const limit = Math.min(requestedPageSize, APP.MAX_PAGE_SIZE);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset
  };
};

module.exports = {
  getPagination
};
