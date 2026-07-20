const express = require('express');
const expenseController = require('../controllers/expense.controller');
const asyncHandler = require('../utils/async-handler');

const router = express.Router();

router.get('/', asyncHandler(expenseController.getExpenses));
router.get('/:id', asyncHandler(expenseController.getExpense));
router.post('/', asyncHandler(expenseController.createExpense));
router.put('/:id', asyncHandler(expenseController.updateExpense));
router.delete('/:id', asyncHandler(expenseController.deleteExpense));

module.exports = router;
