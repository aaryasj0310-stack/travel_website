const itineraryService = require('../services/itinerary.service');
const { sendSuccess } = require('../utils/api-response');
const { HTTP_STATUS } = require('../utils/constants');

const getItinerariesByTrip = async (req, res) => {
  const result = await itineraryService.getAllItineraries(req.params.tripId);

  sendSuccess(res, {
    message: 'Itineraries retrieved successfully.',
    data: result
  });
};

const getItinerary = async (req, res) => {
  const result = await itineraryService.getItineraryById(req.params.id);

  sendSuccess(res, {
    message: 'Itinerary entry retrieved successfully.',
    data: result
  });
};

const createItinerary = async (req, res) => {
  const result = await itineraryService.createItinerary(req.body);

  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Itinerary entry created successfully.',
    data: result
  });
};

const updateItinerary = async (req, res) => {
  const result = await itineraryService.updateItinerary(req.params.id, req.body);

  sendSuccess(res, {
    message: 'Itinerary entry updated successfully.',
    data: result
  });
};

const deleteItinerary = async (req, res) => {
  const result = await itineraryService.deleteItinerary(req.params.id);

  sendSuccess(res, {
    message: 'Itinerary entry deleted successfully.',
    data: result
  });
};

module.exports = {
  getItinerariesByTrip,
  getItinerary,
  createItinerary,
  updateItinerary,
  deleteItinerary
};
