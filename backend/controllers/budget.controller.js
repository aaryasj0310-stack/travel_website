const budgetService = require('../services/budget.service');
const { sendSuccess } = require('../utils/api-response');
const { HTTP_STATUS } = require('../utils/constants');

const getCategories = async (req, res) => {
  const categories = await budgetService.getCategories();

  sendSuccess(res, {
    message: 'Budget categories retrieved successfully.',
    data: { categories }
  });
};

const getBudgets = async (req, res) => {
  const budgets = await budgetService.getAllBudgets({
    userId: req.session.userId
  });

  sendSuccess(res, {
    message: 'Budgets retrieved successfully.',
    data: { budgets }
  });
};

const getBudget = async (req, res) => {
  const budget = await budgetService.getBudgetByTripId(req.params.tripId, req.session.userId);

  sendSuccess(res, {
    message: 'Budget retrieved successfully.',
    data: { budget }
  });
};

const createBudget = async (req, res) => {
  const budget = await budgetService.createBudget(req.params.tripId, req.body, req.session.userId);

  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Budget created successfully.',
    data: { budget }
  });
};

const updateBudget = async (req, res) => {
  const budget = await budgetService.updateBudget(req.params.tripId, req.body, req.session.userId);

  sendSuccess(res, {
    message: 'Budget updated successfully.',
    data: { budget }
  });
};

const deleteBudget = async (req, res) => {
  await budgetService.deleteBudget(req.params.tripId, req.session.userId);

  sendSuccess(res, {
    message: 'Budget deleted successfully.',
    data: {}
  });
};

module.exports = {
  getCategories,
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
};
