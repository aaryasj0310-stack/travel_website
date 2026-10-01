const { paise, decimal } = require('../utils/money');
const { ownedTrip } = require('./ownership.service');
const expenseModel = require('../models/expense.model');
const budgetModel = require('../models/budget.model');
const { validate } = require('../utils/validator');
const { isValidDateString } = require('../utils/date-time');
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
  amount: payload.amount === undefined ? undefined : decimal(paise(payload.amount)),
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
        paise(value) > 0
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
        paise(value) > 0
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

const getBudgetForExpense = async (budgetId, userId) => {
  const budget = await budgetModel.findById(budgetId);

  if (!budget) {
    throw new NotFoundError('Budget not found.');
  }

  await ownedTrip(budget.tripId, userId);
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


const buildBudgetSummary = async (budgetId, userId) => {
  const budget = await getBudgetForExpense(budgetId, userId);
  const totalSpent = await expenseModel.sumByBudgetId(budgetId);
  const remainingBudget = decimal(paise(budget.totalAmount) - paise(totalSpent));

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
    await getBudgetForExpense(queryFilters.budgetId, filters.userId);
  }

  if (filters.tripId !== undefined) {
    queryFilters.tripId = toPositiveInteger(filters.tripId, 'tripId');
    await ownedTrip(queryFilters.tripId, filters.userId);
  }

  if (filters.categoryId !== undefined) {
    queryFilters.categoryId = toPositiveInteger(filters.categoryId, 'categoryId');
  }

  queryFilters.userId = toPositiveInteger(filters.userId, 'userId');

  const expenses = await expenseModel.findAll(queryFilters);
  const response = { expenses };

  if (queryFilters.budgetId !== undefined) {
    response.summary = await buildBudgetSummary(queryFilters.budgetId, filters.userId);
  }

  return response;
};

const getExpenseById = async (id, userId) => {
  const expenseId = toPositiveInteger(id, 'id');
  const expense = await expenseModel.findById(expenseId);

  if (!expense) {
    throw new NotFoundError('Expense not found.');
  }

  const summary = await buildBudgetSummary(expense.budgetId, userId);

  return { expense, summary };
};

const createExpense = async (payload, userId) => {
  const expense = normalizeExpensePayload(payload);
  validateExpensePayload(expense);

  const budget = await getBudgetForExpense(expense.budgetId, userId);
  await validateCategoryForBudget(expense.budgetId, expense.categoryId);

  const createdExpense = await expenseModel.create({
    tripId: budget.tripId,
    budgetId: expense.budgetId,
    categoryId: expense.categoryId,
    amount: expense.amount,
    expenseDate: expense.expenseDate,
    description: expense.description
  });

  const summary = await buildBudgetSummary(expense.budgetId, userId);

  return { expense: createdExpense, summary };
};

const updateExpense = async (id, payload, userId) => {
  const expenseId = toPositiveInteger(id, 'id');
  const existingExpense = await expenseModel.findById(expenseId);

  if (!existingExpense) {
    throw new NotFoundError('Expense not found.');
  }
  await ownedTrip(existingExpense.tripId, userId);

  const expense = normalizeExpensePayload(payload);
  validateUpdatePayload(expense);

  await validateCategoryForBudget(existingExpense.budgetId, expense.categoryId);

  await expenseModel.update(expenseId, expense);

  const updatedExpense = await expenseModel.findById(expenseId);
  const summary = await buildBudgetSummary(existingExpense.budgetId, userId);

  return { expense: updatedExpense, summary };
};

const deleteExpense = async (id, userId) => {
  const expenseId = toPositiveInteger(id, 'id');
  const existingExpense = await expenseModel.findById(expenseId);

  if (!existingExpense) {
    throw new NotFoundError('Expense not found.');
  }
  await ownedTrip(existingExpense.tripId, userId);

  await expenseModel.remove(expenseId);

  const summary = await buildBudgetSummary(existingExpense.budgetId, userId);

  return { summary };
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};
