const expenseModel = require('../models/expense.model');
const budgetModel = require('../models/budget.model');
const { validate } = require('../utils/validator');
const { isValidDateString } = require('../utils/date-time');
const { APP } = require('../utils/constants');
const { NotFoundError, ValidationError } = require('../utils/errors');

const toPositiveInteger = (value, field) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    throw new ValidationError(undefined, [{
      field,
      message: `${field} must be a positive integer.`
    }]);
  }

  return number;
};

const toAmount = (value, field) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError(undefined, [{
      field,
      message: `${field} must be greater than zero.`
    }]);
  }

  return amount;
};

const normalizeDescription = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const normalizeExpensePayload = (payload = {}) => ({
  budgetId: payload.budgetId === undefined ? undefined : Number(payload.budgetId),
  categoryId: payload.categoryId === undefined ? undefined : Number(payload.categoryId),
  amount: payload.amount === undefined ? undefined : Number(payload.amount),
  expenseDate: payload.expenseDate,
  description: normalizeDescription(payload.description)
});

const validateExpensePayload = (expense) => {
  validate(expense, {
    budgetId: {
      required: true,
      custom: (value) => (
        Number.isInteger(value) && value >= 1
          ? null
          : 'budgetId must be a positive integer.'
      )
    },
    categoryId: {
      required: true,
      custom: (value) => (
        Number.isInteger(value) && value >= 1
          ? null
          : 'categoryId must be a positive integer.'
      )
    },
    amount: {
      required: true,
      custom: (value) => (
        Number.isFinite(value) && value > 0
          ? null
          : 'amount must be greater than zero.'
      )
    },
    expenseDate: {
      required: true,
      type: 'string',
      custom: (value) => (
        isValidDateString(value) ? null : 'expenseDate must use YYYY-MM-DD format.'
      )
    },
    description: {
      type: 'string',
      maxLength: 200
    }
  });
};

const validateUpdatePayload = (expense) => {
  validate(expense, {
    categoryId: {
      required: true,
      custom: (value) => (
        Number.isInteger(value) && value >= 1
          ? null
          : 'categoryId must be a positive integer.'
      )
    },
    amount: {
      required: true,
      custom: (value) => (
        Number.isFinite(value) && value > 0
          ? null
          : 'amount must be greater than zero.'
      )
    },
    expenseDate: {
      required: true,
      type: 'string',
      custom: (value) => (
        isValidDateString(value) ? null : 'expenseDate must use YYYY-MM-DD format.'
      )
    },
    description: {
      type: 'string',
      maxLength: 200
    }
  });
};

const getBudgetForExpense = async (budgetId) => {
  const budget = await budgetModel.findById(budgetId);

  if (!budget) {
    throw new NotFoundError('Budget not found.');
  }

  return budget;
};

const validateCategoryForBudget = async (budgetId, categoryId) => {
  const exists = await expenseModel.categoryExistsForBudget(budgetId, categoryId);

  if (!exists) {
    throw new ValidationError(undefined, [{
      field: 'categoryId',
      message: 'categoryId must belong to the selected budget.'
    }]);
  }
};

const validateBudgetCapacity = async (budgetId, amount, excludeExpenseId = null) => {
  const budget = await getBudgetForExpense(budgetId);
  const currentSpent = await expenseModel.sumByBudgetId(budgetId, excludeExpenseId);
  const projectedTotal = currentSpent + amount;

  if (projectedTotal > budget.totalAmount) {
    throw new ValidationError('This expense would exceed the total trip budget.', [{
      field: 'amount',
      message: `Adding this expense would exceed the total budget of ${budget.totalAmount}. Remaining: ${Math.max(budget.totalAmount - currentSpent, 0).toFixed(2)}.`
    }]);
  }
};

const buildBudgetSummary = async (budgetId) => {
  const budget = await getBudgetForExpense(budgetId);
  const totalSpent = await expenseModel.sumByBudgetId(budgetId);
  const remainingBudget = budget.totalAmount - totalSpent;

  return {
    budgetId: budget.id,
    tripId: budget.tripId,
    totalBudget: budget.totalAmount,
    totalSpent,
    remainingBudget
  };
};

const getAllExpenses = async (filters = {}) => {
  const queryFilters = {};

  if (filters.budgetId !== undefined) {
    queryFilters.budgetId = toPositiveInteger(filters.budgetId, 'budgetId');
    await getBudgetForExpense(queryFilters.budgetId);
  }

  if (filters.tripId !== undefined) {
    queryFilters.tripId = toPositiveInteger(filters.tripId, 'tripId');
  }

  if (filters.categoryId !== undefined) {
    queryFilters.categoryId = toPositiveInteger(filters.categoryId, 'categoryId');
  }

  queryFilters.userId = filters.userId === undefined
    ? APP.DEFAULT_USER_ID
    : toPositiveInteger(filters.userId, 'userId');

  const expenses = await expenseModel.findAll(queryFilters);
  const response = { expenses };

  if (queryFilters.budgetId !== undefined) {
    response.summary = await buildBudgetSummary(queryFilters.budgetId);
  }

  return response;
};

const getExpenseById = async (id) => {
  const expenseId = toPositiveInteger(id, 'id');
  const expense = await expenseModel.findById(expenseId);

  if (!expense) {
    throw new NotFoundError('Expense not found.');
  }

  const summary = await buildBudgetSummary(expense.budgetId);

  return { expense, summary };
};

const createExpense = async (payload) => {
  const expense = normalizeExpensePayload(payload);
  validateExpensePayload(expense);

  const budget = await getBudgetForExpense(expense.budgetId);
  await validateCategoryForBudget(expense.budgetId, expense.categoryId);
  await validateBudgetCapacity(expense.budgetId, expense.amount);

  const createdExpense = await expenseModel.create({
    tripId: budget.tripId,
    budgetId: expense.budgetId,
    categoryId: expense.categoryId,
    amount: expense.amount,
    expenseDate: expense.expenseDate,
    description: expense.description
  });

  const summary = await buildBudgetSummary(expense.budgetId);

  return { expense: createdExpense, summary };
};

const updateExpense = async (id, payload) => {
  const expenseId = toPositiveInteger(id, 'id');
  const existingExpense = await expenseModel.findById(expenseId);

  if (!existingExpense) {
    throw new NotFoundError('Expense not found.');
  }

  const expense = normalizeExpensePayload(payload);
  validateUpdatePayload(expense);

  await validateCategoryForBudget(existingExpense.budgetId, expense.categoryId);
  await validateBudgetCapacity(existingExpense.budgetId, expense.amount, expenseId);

  await expenseModel.update(expenseId, expense);

  const updatedExpense = await expenseModel.findById(expenseId);
  const summary = await buildBudgetSummary(existingExpense.budgetId);

  return { expense: updatedExpense, summary };
};

const deleteExpense = async (id) => {
  const expenseId = toPositiveInteger(id, 'id');
  const existingExpense = await expenseModel.findById(expenseId);

  if (!existingExpense) {
    throw new NotFoundError('Expense not found.');
  }

  await expenseModel.remove(expenseId);

  const summary = await buildBudgetSummary(existingExpense.budgetId);

  return { summary };
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};
