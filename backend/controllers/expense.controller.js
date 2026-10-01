const expenseService = require('../services/expense.service');
const { sendSuccess } = require('../utils/api-response');
const { HTTP_STATUS } = require('../utils/constants');

const getExpenses = async (req, res) => {
  const result = await expenseService.getAllExpenses({
    budgetId: req.query.budgetId,
    tripId: req.query.tripId,
    categoryId: req.query.categoryId,
    userId: req.session.userId
  });

  sendSuccess(res, {
    message: 'Expenses retrieved successfully.',
    data: result
  });
};

const getExpense = async (req, res) => {
  const result = await expenseService.getExpenseById(req.params.id, req.session.userId);

  sendSuccess(res, {
    message: 'Expense retrieved successfully.',
    data: result
  });
};

const createExpense = async (req, res) => {
  const result = await expenseService.createExpense(req.body, req.session.userId);

  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Expense created successfully.',
    data: result
  });
};

const updateExpense = async (req, res) => {
  const result = await expenseService.updateExpense(req.params.id, req.body, req.session.userId);

  sendSuccess(res, {
    message: 'Expense updated successfully.',
    data: result
  });
};

const deleteExpense = async (req, res) => {
  const result = await expenseService.deleteExpense(req.params.id, req.session.userId);

  sendSuccess(res, {
    message: 'Expense deleted successfully.',
    data: result
  });
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense
};
