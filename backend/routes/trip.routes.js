const express = require('express');
const tripController = require('../controllers/trip.controller');
const asyncHandler = require('../utils/async-handler');

const router = express.Router();

router.get('/', asyncHandler(tripController.getTrips));
router.get('/:id', asyncHandler(tripController.getTrip));
router.post('/', asyncHandler(tripController.createTrip));
router.put('/:id', asyncHandler(tripController.updateTrip));
router.delete('/:id', asyncHandler(tripController.deleteTrip));

module.exports = router;
