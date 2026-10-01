const database = require('../config/database');

const findById = async (id) => (await database.query('SELECT id, name, email, password_hash FROM users WHERE id = ?', [id]))[0] || null;
const findByEmail = async (email) => (await database.query('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]))[0] || null;
const create = async (name, email, hash) => {
  const result = await database.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
  return findById(result.insertId);
};
const update = async (id, name, email) => {
  await database.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  return findById(id);
};
const changePassword = (id, hash) => database.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
module.exports = { findById, findByEmail, create, update, changePassword };
