const database = require('../config/database');

const formatDateOnly = (value) => {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const mapActivity = (row) => ({
  id: row.id,
  itineraryDayId: row.itinerary_day_id,
  tripId: row.trip_id,
  date: formatDateOnly(row.day_date),
  dayNumber: row.day_number,
  startTime: row.activity_time,
  endTime: row.end_time || null,
  title: row.title,
  location: row.location,
  description: row.notes || null,
  sequenceOrder: row.sequence_order,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const activitySelectColumns = `
  a.id,
  a.itinerary_day_id,
  d.trip_id,
  d.day_date,
  d.day_number,
  a.activity_time,
  a.end_time,
  a.title,
  a.location,
  a.notes,
  a.sequence_order,
  a.created_at,
  a.updated_at
`;

const findAllByTripId = async (tripId) => {
  const rows = await database.query(
    `SELECT ${activitySelectColumns}
     FROM itinerary_activities a
     JOIN itinerary_days d ON d.id = a.itinerary_day_id
     WHERE d.trip_id = ?
     ORDER BY d.day_date ASC, a.sequence_order ASC, a.activity_time ASC, a.id ASC`,
    [tripId]
  );
  return rows.map(mapActivity);
};

const findById = async (id) => {
  const rows = await database.query(
    `SELECT ${activitySelectColumns}
     FROM itinerary_activities a
     JOIN itinerary_days d ON d.id = a.itinerary_day_id
     WHERE a.id = ?
     LIMIT 1`,
    [id]
  );
  return rows.length > 0 ? mapActivity(rows[0]) : null;
};

const ensureDayExists = async (tripId, date) => {
  const rows = await database.query(
    `SELECT id, day_number FROM itinerary_days WHERE trip_id = ? AND day_date = ? LIMIT 1`,
    [tripId, date]
  );
  
  if (rows.length > 0) {
    return rows[0].id;
  }
  
  // Calculate day_number based on trip start date
  const tripRows = await database.query(`SELECT start_date FROM trips WHERE id = ? LIMIT 1`, [tripId]);
  if (tripRows.length === 0) throw new Error('Trip not found');
  
  const tripStartDate = new Date(tripRows[0].start_date);
  const activityDate = new Date(date);
  const diffTime = Math.abs(activityDate - tripStartDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  let dayNumber = diffDays;
  
  // Ensure day_number is unique
  let isUnique = false;
  while (!isUnique) {
    const existingNum = await database.query(
        `SELECT 1 FROM itinerary_days WHERE trip_id = ? AND day_number = ? LIMIT 1`,
        [tripId, dayNumber]
    );
    if (existingNum.length > 0) {
        dayNumber++;
    } else {
        isUnique = true;
    }
  }

  const result = await database.query(
    `INSERT INTO itinerary_days (trip_id, day_date, day_number) VALUES (?, ?, ?)`,
    [tripId, date, dayNumber]
  );
  return result.insertId;
};

const create = async (activity) => {
  const dayId = await ensureDayExists(activity.tripId, activity.date);
  
  const result = await database.query(
    `INSERT INTO itinerary_activities (
      itinerary_day_id,
      activity_time,
      end_time,
      title,
      location,
      notes,
      sequence_order
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      dayId,
      activity.startTime,
      activity.endTime,
      activity.title,
      activity.location,
      activity.description,
      activity.sequenceOrder || 0
    ]
  );

  return findById(result.insertId);
};

const update = async (id, activity) => {
  const dayId = await ensureDayExists(activity.tripId, activity.date);

  const result = await database.query(
    `UPDATE itinerary_activities
     SET
       itinerary_day_id = ?,
       activity_time = ?,
       end_time = ?,
       title = ?,
       location = ?,
       notes = ?,
       sequence_order = ?
     WHERE id = ?`,
    [
      dayId,
      activity.startTime,
      activity.endTime,
      activity.title,
      activity.location,
      activity.description,
      activity.sequenceOrder || 0,
      id
    ]
  );
  
  // Cleanup orphaned days asynchronously, best effort
  database.query(`
    DELETE FROM itinerary_days 
    WHERE trip_id = ? 
    AND id NOT IN (SELECT itinerary_day_id FROM itinerary_activities)
  `, [activity.tripId]).catch(() => {});

  return result.affectedRows;
};

const remove = async (id) => {
  const existing = await findById(id);
  if (!existing) return 0;
  
  const result = await database.query('DELETE FROM itinerary_activities WHERE id = ?', [id]);
  
  // Cleanup orphaned day
  database.query(`
    DELETE FROM itinerary_days 
    WHERE id = ? 
    AND id NOT IN (SELECT itinerary_day_id FROM itinerary_activities)
  `, [existing.itineraryDayId]).catch(() => {});

  return result.affectedRows;
};

module.exports = {
  findAllByTripId,
  findById,
  create,
  update,
  remove
};
