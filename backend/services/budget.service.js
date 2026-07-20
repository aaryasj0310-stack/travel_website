const budgetModel = require('../models/budget.model');
const budgetCategoryModel = require('../models/budget-category.model');
const tripModel = require('../models/trip.model');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { APP } = require('../utils/constants');

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

const validateTripExists = async (tripId) => {
  const trip = await tripModel.findById(tripId);

  if (!trip) {
    throw new NotFoundError('Trip not found.');
  }

  return trip;
};

const normalizeBudgetPayload = (payload, categories) => {
  const totalAmount = Number(payload.totalAmount);

  const allocationMap = {};

  if (Array.isArray(payload.allocations)) {
    payload.allocations.forEach((a) => {
      allocationMap[Number(a.categoryId)] = Number(a.allocatedAmount) || 0;
    });
  }

  const allocations = categories.map((category) => ({
    categoryId: category.id,
    allocatedAmount: allocationMap[category.id] || 0
  }));

  return { totalAmount, allocations };
};

const validateBudgetPayload = (totalAmount, allocations) => {
  const errors = [];

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    errors.push({ field: 'totalAmount', message: 'totalAmount must be greater than zero.' });
  }

  let sumAllocations = 0;
  allocations.forEach((allocation) => {
    if (!Number.isFinite(allocation.allocatedAmount) || allocation.allocatedAmount < 0) {
      errors.push({
        field: `allocation_${allocation.categoryId}`,
        message: 'Category allocation must be zero or greater.'
      });
    } else {
      sumAllocations += allocation.allocatedAmount;
    }
  });

  if (sumAllocations > totalAmount) {
    errors.push({ field: 'allocations', message: 'Total allocations cannot exceed the total budget amount.' });
  }

  if (errors.length > 0) {
    throw new ValidationError(undefined, errors);
  }
};

const getCategories = async () => {
  return budgetCategoryModel.findAllActive();
};

const createBudget = async (tripId, payload) => {
  const id = toPositiveInteger(tripId, 'tripId');

  await validateTripExists(id);

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

const getBudgetByTripId = async (tripId) => {
  const id = toPositiveInteger(tripId, 'tripId');

  await validateTripExists(id);

  const budget = await budgetModel.findByTripId(id);

  if (!budget) {
    throw new NotFoundError('Budget not found for this trip.');
  }

  return budget;
};

const updateBudget = async (tripId, payload) => {
  const id = toPositiveInteger(tripId, 'tripId');

  await validateTripExists(id);

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

const deleteBudget = async (tripId) => {
  const id = toPositiveInteger(tripId, 'tripId');

  await validateTripExists(id);

  const exists = await budgetModel.existsForTrip(id);

  if (!exists) {
    throw new NotFoundError('Budget not found for this trip.');
  }

  await budgetModel.remove(id);
};

const getAllBudgets = async (filters = {}) => {
  const userId = filters.userId === undefined
    ? APP.DEFAULT_USER_ID
    : toPositiveInteger(filters.userId, 'userId');

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
