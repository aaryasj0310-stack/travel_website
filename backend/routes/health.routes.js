const express = require('express');
const asyncHandler = require('../utils/async-handler');
const { sendSuccess } = require('../utils/api-response');
const { MESSAGES } = require('../utils/constants');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: MESSAGES.HEALTH_OK,
    data: {
      uptime: process.uptime()
    }
  });
}));

module.exports = router;
