const { ownedTrip } = require('./ownership.service');
const tripModel = require('../models/trip.model');
const { validate } = require('../utils/validator');
const { isValidDateString, tripStatus } = require('../utils/date-time');
const { TRIP_STATUS } = require('../utils/constants');
const { NotFoundError, ValidationError } = require('../utils/errors');

const allowedStatuses = Object.values(TRIP_STATUS);

const toPositiveInteger = (value, field) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    throw new ValidationError(undefined, [{
      field,
      message: `${field} must be a positive integer.`
    }]);
  }

  return number;
};

const normalizeTripPayload = (payload = {}, fallbackUserId) => ({
  userId: fallbackUserId,
  destination: typeof payload.destination === 'string' ? payload.destination.trim() : payload.destination,
  startDate: payload.startDate,
  endDate: payload.endDate,
  description: typeof payload.description === 'string' && payload.description.trim() !== ''
    ? payload.description.trim()
    : null,
  numTravelers: payload.numTravelers === undefined ? 1 : Number(payload.numTravelers),
  status: tripStatus(payload)
});

const validateTripPayload = (trip) => {
  validate(trip, {
    userId: {
      required: true,
      custom: (value) => (
        Number.isSafeInteger(value) && value >= 1
          ? null
          : 'userId must be a positive integer.'
      )
    },
    destination: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 100
    },
    startDate: {
      required: true,
      type: 'string',
      custom: (value) => (
        isValidDateString(value) ? null : 'startDate must use YYYY-MM-DD format.'
      )
    },
    endDate: {
      required: true,
      type: 'string',
      custom: (value, data) => {
        if (!isValidDateString(value)) {
          return 'endDate must use YYYY-MM-DD format.';
        }

        return value >= data.startDate ? null : 'endDate must be on or after startDate.';
      }
    },
    description: {
      type: 'string',
      maxLength: 500
    },
    numTravelers: {
      required: true,
      max: 10000,
      custom: (value) => (
        Number.isInteger(value) && value >= 1
          ? null
          : 'numTravelers must be a positive integer.'
      )
    },
    status: {
      required: true,
      allowedValues: allowedStatuses
    }
  });
};

const getAllTrips = async (filters = {}) => {
  const userId = toPositiveInteger(filters.userId, 'userId');

  return (await tripModel.findAllByUserId(userId)).map(trip => ({ ...trip, status: tripStatus(trip) }));
};

const getTripById = async (id, userId) => {
  const tripId = toPositiveInteger(id, 'id');
  const trip = await ownedTrip(tripId, userId);

  if (!trip) {
    throw new NotFoundError('Trip not found.');
  }

  return { ...trip, status: tripStatus(trip) };
};

const createTrip = async (payload, userId) => {
  const trip = normalizeTripPayload(payload, toPositiveInteger(userId, 'userId'));
  validateTripPayload(trip);

  return tripModel.create(trip);
};

const updateTrip = async (id, payload, userId) => {
  const tripId = toPositiveInteger(id, 'id');
  const existingTrip = await getTripById(tripId, userId);

  const trip = normalizeTripPayload(payload, existingTrip.userId);
  validateTripPayload(trip);

  await tripModel.update(tripId, trip);
  return getTripById(tripId, userId);
};

const deleteTrip = async (id, userId) => {
  const tripId = toPositiveInteger(id, 'id');
  await getTripById(tripId, userId);
  await tripModel.remove(tripId);
};

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip
};
