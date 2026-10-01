const service = require('../services/auth.service');
const { sendSuccess } = require('../utils/api-response');
const { csrfToken } = require('../middleware/auth.middleware');
const env = require('../config/env');

const renewSession = async (req, user) => {
  await new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
  req.session.userId = user.id;
  const token = csrfToken(req);
  await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
  return { user, csrfToken: token };
};
const register = async (req, res) => sendSuccess(res, { statusCode: 201, data: await renewSession(req, await service.register(req.body)) });
const login = async (req, res) => sendSuccess(res, { data: await renewSession(req, await service.login(req.body)) });
const current = async (req, res) => sendSuccess(res, { data: { user: await service.current(req.session.userId), csrfToken: csrfToken(req) } });
const token = async (req, res) => sendSuccess(res, { data: { csrfToken: csrfToken(req) } });
const update = async (req, res) => sendSuccess(res, { data: { user: await service.update(req.session.userId, req.body) } });
const changePassword = async (req, res) => sendSuccess(res, { data: await renewSession(req, await service.changePassword(req.session.userId, req.body)) });
const logout = async (req, res) => {
  await new Promise((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));
  res.clearCookie(env.session.name, { path: '/', httpOnly: true, sameSite: 'lax', secure: env.nodeEnv === 'production' });
  sendSuccess(res, { message: 'Signed out.', data: {} });
};
module.exports = { register, login, current, token, update, changePassword, logout };
