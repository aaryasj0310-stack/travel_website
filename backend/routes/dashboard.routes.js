const router = require('express').Router();
const { getDashboard } = require('../controllers/dashboard.controller');
const asyncHandler = require('../utils/async-handler');
router.get('/', asyncHandler(getDashboard));
module.exports = router;
