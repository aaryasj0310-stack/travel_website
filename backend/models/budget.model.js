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

const mapBudget = (row) => ({
  id: row.id,
  tripId: row.trip_id,
  totalAmount: Number(row.total_amount),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapAllocation = (row) => ({
  id: row.allocation_id,
  budgetId: row.budget_id,
  categoryId: row.category_id,
  categoryName: row.category_name,
  categorySlug: row.category_slug,
  displayOrder: row.display_order,
  allocatedAmount: Number(row.allocated_amount),
  spentAmount: Number(row.spent_amount)
});

const findById = async (id) => {
  const rows = await database.query(
    `SELECT id, trip_id, total_amount, created_at, updated_at
     FROM trip_budgets
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows.length > 0 ? mapBudget(rows[0]) : null;
};

const findByTripId = async (tripId) => {
  const budgetRows = await database.query(
    `SELECT id, trip_id, total_amount, created_at, updated_at
     FROM trip_budgets
     WHERE trip_id = ?
     LIMIT 1`,
    [tripId]
  );

  if (budgetRows.length === 0) {
    return null;
  }

  const budget = mapBudget(budgetRows[0]);

  const allocationRows = await database.query(
    `SELECT
       ba.id AS allocation_id,
       ba.budget_id,
       ba.category_id,
       bc.name AS category_name,
       bc.slug AS category_slug,
       bc.display_order,
       ba.allocated_amount,
       COALESCE(SUM(e.amount), 0) AS spent_amount
     FROM budget_allocations ba
     JOIN budget_categories bc ON bc.id = ba.category_id
     LEFT JOIN expenses e ON e.budget_id = ba.budget_id AND e.category_id = ba.category_id
     WHERE ba.budget_id = ?
     GROUP BY ba.id, ba.budget_id, ba.category_id, bc.name, bc.slug, bc.display_order, ba.allocated_amount
     ORDER BY bc.display_order ASC`,
    [budget.id]
  );

  budget.allocations = allocationRows.map(mapAllocation);

  return budget;
};

const findAllByUserId = async (userId) => {
  const rows = await database.query(
    `SELECT
       tb.id,
       tb.trip_id,
       tb.total_amount,
       tb.created_at,
       tb.updated_at,
       t.destination,
       t.start_date,
       t.end_date,
       t.status,
       COALESCE(SUM(e.amount), 0) AS total_spent
     FROM trip_budgets tb
     JOIN trips t ON t.id = tb.trip_id
     LEFT JOIN expenses e ON e.trip_id = tb.trip_id
     WHERE t.user_id = ?
     GROUP BY tb.id, tb.trip_id, tb.total_amount, tb.created_at, tb.updated_at,
              t.destination, t.start_date, t.end_date, t.status
     ORDER BY t.start_date ASC`,
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    tripId: row.trip_id,
    totalAmount: Number(row.total_amount),
    totalSpent: Number(row.total_spent),
    destination: row.destination,
    startDate: formatDateOnly(row.start_date),
    endDate: formatDateOnly(row.end_date),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const existsForTrip = async (tripId) => {
  const rows = await database.query(
    'SELECT 1 FROM trip_budgets WHERE trip_id = ? LIMIT 1',
    [tripId]
  );

  return rows.length > 0;
};

const create = async (tripId, totalAmount, allocations) => {
  return database.transaction(async (connection) => {
    const [budgetResult] = await connection.execute(
      'INSERT INTO trip_budgets (trip_id, total_amount) VALUES (?, ?)',
      [tripId, totalAmount]
    );

    const budgetId = budgetResult.insertId;

    for (const allocation of allocations) {
      await connection.execute(
        'INSERT INTO budget_allocations (budget_id, category_id, allocated_amount) VALUES (?, ?, ?)',
        [budgetId, allocation.categoryId, allocation.allocatedAmount]
      );
    }

    return budgetId;
  });
};

const update = async (tripId, totalAmount, allocations) => {
  return database.transaction(async (connection) => {
    const [budgetRows] = await connection.execute(
      'SELECT id FROM trip_budgets WHERE trip_id = ? LIMIT 1',
      [tripId]
    );

    if (budgetRows.length === 0) {
      return 0;
    }

    const budgetId = budgetRows[0].id;

    await connection.execute(
      'UPDATE trip_budgets SET total_amount = ? WHERE id = ?',
      [totalAmount, budgetId]
    );

    for (const allocation of allocations) {
      await connection.execute(
        'UPDATE budget_allocations SET allocated_amount = ? WHERE budget_id = ? AND category_id = ?',
        [allocation.allocatedAmount, budgetId, allocation.categoryId]
      );
    }

    return 1;
  });
};

const remove = async (tripId) => {
  const result = await database.query(
    'DELETE FROM trip_budgets WHERE trip_id = ?',
    [tripId]
  );

  return result.affectedRows;
};

module.exports = {
  findById,
  findByTripId,
  findAllByUserId,
  existsForTrip,
  create,
  update,
  remove
};
