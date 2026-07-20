const mysql = require('mysql2/promise');
const env = require('./env');
const { DatabaseError } = require('../utils/errors');

const pool = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  user: env.database.user,
  password: env.database.password,
  database: env.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    throw new DatabaseError(undefined, [{
      code: error.code,
      message: error.message
    }]);
  }
};

const transaction = async (callback) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();

    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(undefined, [{
      code: error.code,
      message: error.message
    }]);
  } finally {
    connection.release();
  }
};

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
  } catch (error) {
    throw new DatabaseError(undefined, [{
      code: error.code,
      message: error.message
    }]);
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};
