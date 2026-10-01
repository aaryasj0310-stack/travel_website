const crypto = require('crypto');
const { UnauthorizedError, AppError } = require('../utils/errors');
const requireAuth = (req, res, next) => req.session.userId ? next() : next(new UnauthorizedError('Please sign in to continue.'));
const csrfToken = (req) => req.session.csrfToken ||= crypto.randomBytes(32).toString('hex');
const protectMutation = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const token = req.get('X-CSRF-Token');
  if (!token || token !== req.session.csrfToken) return next(new AppError('Session security check failed. Refresh the page and try again.', 403));
  next();
};
// ponytail: per-process limit for the single-server college app; use a shared store before scaling.
const attempts = new Map();
const authLimit = (req, res, next) => {
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
  const entry = attempts.get(req.ip) || { count: 0, until: now + 15 * 60 * 1000 };
  entry.count++;
  attempts.set(req.ip, entry);
  if (entry.count > 30) return next(new AppError('Too many attempts. Please try again in 15 minutes.', 429));
  next();
};
module.exports = { requireAuth, csrfToken, protectMutation, authLimit };
