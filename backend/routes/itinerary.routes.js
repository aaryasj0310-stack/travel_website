const express = require('express');
const itineraryController = require('../controllers/itinerary.controller');
const asyncHandler = require('../utils/async-handler');

const router = express.Router();
const tripItineraryRouter = express.Router({ mergeParams: true });

router.get('/:id', asyncHandler(itineraryController.getItinerary));
router.post('/', asyncHandler(itineraryController.createItinerary));
router.put('/:id', asyncHandler(itineraryController.updateItinerary));
router.delete('/:id', asyncHandler(itineraryController.deleteItinerary));

tripItineraryRouter.get('/', asyncHandler(itineraryController.getItinerariesByTrip));

module.exports = {
  router,
  tripItineraryRouter
};
