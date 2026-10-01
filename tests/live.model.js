// Cleanup is scoped to accounts created by the opt-in live test in this run.
const database = require('../backend/config/database');
const removeTestUser = (id, email) => database.query('DELETE FROM users WHERE id = ? AND email = ?', [id, email]);
module.exports = { removeTestUser };
