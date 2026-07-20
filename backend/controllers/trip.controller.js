const tripService = require('../services/trip.service');
const { sendSuccess } = require('../utils/api-response');
const { HTTP_STATUS } = require('../utils/constants');

const getTrips = async (req, res) => {
  const trips = await tripService.getAllTrips({
    userId: req.query.userId
  });

  sendSuccess(res, {
    message: 'Trips retrieved successfully.',
    data: { trips }
  });
};

const getTrip = async (req, res) => {
  const trip = await tripService.getTripById(req.params.id);

  sendSuccess(res, {
    message: 'Trip retrieved successfully.',
    data: { trip }
  });
};

const createTrip = async (req, res) => {
  const trip = await tripService.createTrip(req.body);

  sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Trip created successfully.',
    data: { trip }
  });
};

const updateTrip = async (req, res) => {
  const trip = await tripService.updateTrip(req.params.id, req.body);

  sendSuccess(res, {
    message: 'Trip updated successfully.',
    data: { trip }
  });
};

const deleteTrip = async (req, res) => {
  await tripService.deleteTrip(req.params.id);

  sendSuccess(res, {
    message: 'Trip deleted successfully.',
    data: {}
  });
};

module.exports = {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip
};
