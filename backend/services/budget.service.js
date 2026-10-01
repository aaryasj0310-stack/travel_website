const { paise, decimal, sum } = require('../utils/money');
const { ownedTrip } = require('./ownership.service');
const budgetModel = require('../models/budget.model');
const budgetCategoryModel = require('../models/budget-category.model');
const tripModel = require('../models/trip.model');
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

const validateTripExists = ownedTrip;

const normalizeBudgetPayload = (payload, categories) => {
  if (categories.length !== 6) throw new ValidationError('Budget categories are not configured. Run database/categories.sql before creating budgets.');
  const totalAmount = decimal(paise(payload.totalAmount, 'totalAmount'));
  if (!Array.isArray(payload.allocations)) throw new ValidationError('Category allocations are required.');
  const allocationMap = new Map();
  for (const item of payload.allocations) {
    const id = Number(item.categoryId);
    if (!categories.some(c => Number(c.id) === id) || allocationMap.has(id)) throw new ValidationError('Unknown or repeated budget category.');
    allocationMap.set(id, decimal(paise(item.allocatedAmount, 'allocatedAmount')));
  }
  const allocations = categories.map(category => ({ categoryId: category.id, allocatedAmount: allocationMap.get(Number(category.id)) || '0.00' }));
  return { totalAmount, allocations };
};
const validateBudgetPayload = (totalAmount, allocations) => {
  if (paise(totalAmount) <= 0) throw new ValidationError('Total budget must be greater than zero.');
  if (sum(allocations.map(a => a.allocatedAmount)) > paise(totalAmount)) throw new ValidationError('Total allocations cannot exceed the total budget.');
};

const getCategories = async () => {
  return budgetCategoryModel.findAllActive();
};

const createBudget = async (tripId, payload, userId) => {
  const id = toPositiveInteger(tripId, 'tripId');

  await validateTripExists(id, userId);

  const exists = await budgetModel.existsForTrip(id);

  if (exists) {
    throw new ValidationError('A budget already exists for this trip.', [{
      field: 'tripId',
      message: 'A budget already exists for this trip.'
    }]);
  }

  const categories = await budgetCategoryModel.findAllActive();
  const { totalAmount, allocations } = normalizeBudgetPayload(payload, categories);

  validateBudgetPayload(totalAmount, allocations);

  await budgetModel.create(id, totalAmount, allocations);

  return budgetModel.findByTripId(id);
};

const getBudgetByTripId = async (tripId, userId) => {
  const id = toPositiveInteger(tripId, 'tripId');

  await validateTripExists(id, userId);

  const budget = await budgetModel.findByTripId(id);

  if (!budget) {
    throw new NotFoundError('Budget not found for this trip.');
  }

  return budget;
};

const updateBudget = async (tripId, payload, userId) => {
  const id = toPositiveInteger(tripId, 'tripId');

  await validateTripExists(id, userId);

  const existingBudget = await budgetModel.findByTripId(id);

  if (!existingBudget) {
    throw new NotFoundError('Budget not found for this trip.');
  }

  const categories = await budgetCategoryModel.findAllActive();
  const { totalAmount, allocations } = normalizeBudgetPayload(payload, categories);

  validateBudgetPayload(totalAmount, allocations);

  await budgetModel.update(id, totalAmount, allocations);

  return budgetModel.findByTripId(id);
};

const deleteBudget = async (tripId, userId) => {
  const id = toPositiveInteger(tripId, 'tripId');

  await validateTripExists(id, userId);

  const exists = await budgetModel.existsForTrip(id);

  if (!exists) {
    throw new NotFoundError('Budget not found for this trip.');
  }

  await budgetModel.remove(id);
};

const getAllBudgets = async (filters = {}) => {
  const userId = toPositiveInteger(filters.userId, 'userId');

  return budgetModel.findAllByUserId(userId);
};

module.exports = {
  getCategories,
  createBudget,
  getBudgetByTripId,
  updateBudget,
  deleteBudget,
  getAllBudgets
};
