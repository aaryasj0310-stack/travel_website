const express = require('express');
const budgetController = require('../controllers/budget.controller');
const asyncHandler = require('../utils/async-handler');

const tripBudgetRouter = express.Router({ mergeParams: true });

tripBudgetRouter.get('/', asyncHandler(budgetController.getBudget));
tripBudgetRouter.post('/', asyncHandler(budgetController.createBudget));
tripBudgetRouter.put('/', asyncHandler(budgetController.updateBudget));
tripBudgetRouter.delete('/', asyncHandler(budgetController.deleteBudget));

const budgetRouter = express.Router();

budgetRouter.get('/', asyncHandler(budgetController.getBudgets));
budgetRouter.get('/categories', asyncHandler(budgetController.getCategories));

module.exports = { tripBudgetRouter, budgetRouter };
