const bcrypt = require('bcrypt');
const users = require('../models/user.model');
const { validate } = require('../utils/validator');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

const publicUser = ({ id, name, email }) => ({ id, name, email });
const profile = (payload) => {
  const data = { name: typeof payload.name === 'string' ? payload.name.trim() : '', email: typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '' };
  validate(data, {
    name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
    email: { required: true, type: 'string', maxLength: 255, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  });
  return data;
};
const password = (value, confirmation) => {
  if (typeof value !== 'string' || value.length < 8 || Buffer.byteLength(value, 'utf8') > 72) {
    throw new ValidationError('Password must have at least 8 characters and at most 72 UTF-8 bytes.');
  }
  if (value !== confirmation) throw new ValidationError('Passwords do not match.');
  return value;
};
const saveUnique = async (operation) => {
  try { return await operation(); }
  catch (error) {
    if (error.errors?.some(item => item.code === 'ER_DUP_ENTRY')) throw new ValidationError('That email address is already registered.');
    throw error;
  }
};
const register = async (payload) => {
  const data = profile(payload);
  const hash = await bcrypt.hash(password(payload.password, payload.confirmPassword), 12);
  return publicUser(await saveUnique(() => users.create(data.name, data.email, hash)));
};
const login = async (payload) => {
  if (typeof payload.email !== 'string' || typeof payload.password !== 'string' || Buffer.byteLength(payload.password) > 72) throw new UnauthorizedError('Invalid email or password.');
  const user = await users.findByEmail(payload.email.trim().toLowerCase());
  // Compare against a valid dummy hash too, avoiding a fast nonexistent-email path.
  const valid = await bcrypt.compare(payload.password, user?.password_hash || '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxodBHrAHthjxRRHVVF0hpHGfMC');
  if (!user || !valid) throw new UnauthorizedError('Invalid email or password.');
  return publicUser(user);
};
const current = async (id) => {
  const user = await users.findById(id);
  if (!user) throw new UnauthorizedError();
  return publicUser(user);
};
const update = async (id, payload) => {
  const data = profile(payload);
  await current(id);
  return publicUser(await saveUnique(() => users.update(id, data.name, data.email)));
};
const changePassword = async (id, payload) => {
  const next = password(payload.newPassword, payload.confirmPassword);
  const user = await users.findById(id);
  if (!user || typeof payload.currentPassword !== 'string' || !await bcrypt.compare(payload.currentPassword, user.password_hash)) throw new ValidationError('Current password is incorrect.');
  await users.changePassword(id, await bcrypt.hash(next, 12));
  return publicUser(user);
};
module.exports = { register, login, current, update, changePassword };
