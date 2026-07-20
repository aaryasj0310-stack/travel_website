const database = require('../config/database');

const formatDateOnly = (value) => {
  if (!value) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
};

const mapTrip = (row) => ({
  id: row.id,
  userId: row.user_id,
  destination: row.destination,
  startDate: formatDateOnly(row.start_date),
  endDate: formatDateOnly(row.end_date),
  description: row.description,
  numTravelers: row.num_travelers,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const findAllByUserId = async (userId) => {
  const rows = await database.query(
    `SELECT
      id,
      user_id,
      destination,
      start_date,
      end_date,
      description,
      num_travelers,
      status,
      created_at,
      updated_at
    FROM trips
    WHERE user_id = ?
    ORDER BY start_date ASC, id ASC`,
    [userId]
  );

  return rows.map(mapTrip);
};

const findById = async (id) => {
  const rows = await database.query(
    `SELECT
      id,
      user_id,
      destination,
      start_date,
      end_date,
      description,
      num_travelers,
      status,
      created_at,
      updated_at
    FROM trips
    WHERE id = ?
    LIMIT 1`,
    [id]
  );

  return rows.length > 0 ? mapTrip(rows[0]) : null;
};

const create = async (trip) => {
  const result = await database.query(
    `INSERT INTO trips (
      user_id,
      destination,
      start_date,
      end_date,
      description,
      num_travelers,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      trip.userId,
      trip.destination,
      trip.startDate,
      trip.endDate,
      trip.description,
      trip.numTravelers,
      trip.status
    ]
  );

  return findById(result.insertId);
};

const update = async (id, trip) => {
  const result = await database.query(
    `UPDATE trips
    SET
      destination = ?,
      start_date = ?,
      end_date = ?,
      description = ?,
      num_travelers = ?,
      status = ?
    WHERE id = ?`,
    [
      trip.destination,
      trip.startDate,
      trip.endDate,
      trip.description,
      trip.numTravelers,
      trip.status,
      id
    ]
  );

  return result.affectedRows;
};

const remove = async (id) => {
  const result = await database.query(
    'DELETE FROM trips WHERE id = ?',
    [id]
  );

  return result.affectedRows;
};

module.exports = {
  findAllByUserId,
  findById,
  create,
  update,
  remove
};
