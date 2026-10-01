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

const mapExpense = (row) => ({
  id: row.id,
  tripId: row.trip_id,
  budgetId: row.budget_id,
  categoryId: row.category_id,
  categoryName: row.category_name || null,
  categorySlug: row.category_slug || null,
  amount: String(row.amount),
  expenseDate: formatDateOnly(row.expense_date),
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const expenseSelectColumns = `
  e.id,
  e.trip_id,
  e.budget_id,
  e.category_id,
  bc.name AS category_name,
  bc.slug AS category_slug,
  e.amount,
  e.expense_date,
  e.description,
  e.created_at,
  e.updated_at
`;

const findAll = async (filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.budgetId !== undefined) {
    conditions.push('e.budget_id = ?');
    params.push(filters.budgetId);
  }

  if (filters.tripId !== undefined) {
    conditions.push('e.trip_id = ?');
    params.push(filters.tripId);
  }

  if (filters.categoryId !== undefined) {
    conditions.push('e.category_id = ?');
    params.push(filters.categoryId);
  }

  if (filters.userId !== undefined) {
    conditions.push('t.user_id = ?');
    params.push(filters.userId);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const joinClause = filters.userId !== undefined ? 'JOIN trips t ON t.id = e.trip_id' : '';

  const rows = await database.query(
    `SELECT ${expenseSelectColumns}
     FROM expenses e
     JOIN budget_categories bc ON bc.id = e.category_id
     ${joinClause}
     ${whereClause}
     ORDER BY e.expense_date DESC, e.id DESC`,
    params
  );

  return rows.map(mapExpense);
};

const findById = async (id) => {
  const rows = await database.query(
    `SELECT ${expenseSelectColumns}
     FROM expenses e
     JOIN budget_categories bc ON bc.id = e.category_id
     WHERE e.id = ?
     LIMIT 1`,
    [id]
  );

  return rows.length > 0 ? mapExpense(rows[0]) : null;
};

const sumByBudgetId = async (budgetId, excludeExpenseId = null) => {
  const params = [budgetId];
  let excludeClause = '';

  if (excludeExpenseId !== null) {
    excludeClause = ' AND id != ?';
    params.push(excludeExpenseId);
  }

  const rows = await database.query(
    `SELECT COALESCE(SUM(amount), 0) AS total_spent
     FROM expenses
     WHERE budget_id = ?${excludeClause}`,
    params
  );

  return String(rows[0].total_spent);
};

const categoryExistsForBudget = async (budgetId, categoryId) => {
  const rows = await database.query(
    `SELECT 1
     FROM budget_allocations
     WHERE budget_id = ? AND category_id = ?
     LIMIT 1`,
    [budgetId, categoryId]
  );

  return rows.length > 0;
};

const create = async (expense) => {
  const result = await database.query(
    `INSERT INTO expenses (
      trip_id,
      budget_id,
      category_id,
      amount,
      expense_date,
      description
    )
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      expense.tripId,
      expense.budgetId,
      expense.categoryId,
      expense.amount,
      expense.expenseDate,
      expense.description
    ]
  );

  return findById(result.insertId);
};

const update = async (id, expense) => {
  const result = await database.query(
    `UPDATE expenses
     SET
       category_id = ?,
       amount = ?,
       expense_date = ?,
       description = ?
     WHERE id = ?`,
    [
      expense.categoryId,
      expense.amount,
      expense.expenseDate,
      expense.description,
      id
    ]
  );

  return result.affectedRows;
};

const remove = async (id) => {
  const result = await database.query(
    'DELETE FROM expenses WHERE id = ?',
    [id]
  );

  return result.affectedRows;
};

module.exports = {
  findAll,
  findById,
  sumByBudgetId,
  categoryExistsForBudget,
  create,
  update,
  remove
};
