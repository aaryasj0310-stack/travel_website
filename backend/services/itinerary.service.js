const itineraryModel = require('../models/itinerary.model');
const tripModel = require('../models/trip.model');
const { validate } = require('../utils/validator');
const { isValidDateString } = require('../utils/date-time');
const { NotFoundError, ValidationError } = require('../utils/errors');

const toPositiveInteger = (value, field) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new ValidationError(undefined, [{ field, message: `${field} must be a positive integer.` }]);
  }
  return number;
};

const normalizeDescription = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const isValidTime = (value) => {
    return /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/.test(value);
};

const normalizePayload = (payload = {}) => ({
  tripId: payload.tripId === undefined ? undefined : Number(payload.tripId),
  date: payload.date,
  startTime: payload.startTime,
  endTime: payload.endTime || null,
  title: payload.title,
  location: payload.location,
  description: normalizeDescription(payload.description),
  sequenceOrder: payload.sequenceOrder === undefined ? 0 : Number(payload.sequenceOrder)
});

const validatePayload = (activity) => {
  validate(activity, {
    tripId: {
      required: true,
      custom: (value) => (Number.isInteger(value) && value >= 1 ? null : 'tripId must be a positive integer.')
    },
    date: {
      required: true,
      type: 'string',
      custom: (value) => (isValidDateString(value) ? null : 'date must use YYYY-MM-DD format.')
    },
    startTime: {
      required: true,
      type: 'string',
      custom: (value) => (isValidTime(value) ? null : 'startTime must be a valid time (HH:MM).')
    },
    endTime: {
      type: 'string',
      custom: (value) => {
          if (!value) return null;
          return isValidTime(value) ? null : 'endTime must be a valid time (HH:MM).';
      }
    },
    title: { required: true, type: 'string', maxLength: 100 },
    location: { required: true, type: 'string', maxLength: 100 },
    description: { type: 'string', maxLength: 300 },
    sequenceOrder: {
      custom: (value) => (Number.isInteger(value) && value >= 0 ? null : 'sequenceOrder must be a positive integer or zero.')
    }
  });
};

const validateUpdatePayload = (activity) => {
  validate(activity, {
    date: {
      required: true,
      type: 'string',
      custom: (value) => (isValidDateString(value) ? null : 'date must use YYYY-MM-DD format.')
    },
    startTime: {
      required: true,
      type: 'string',
      custom: (value) => (isValidTime(value) ? null : 'startTime must be a valid time (HH:MM).')
    },
    endTime: {
      type: 'string',
      custom: (value) => {
          if (!value) return null;
          return isValidTime(value) ? null : 'endTime must be a valid time (HH:MM).';
      }
    },
    title: { required: true, type: 'string', maxLength: 100 },
    location: { required: true, type: 'string', maxLength: 100 },
    description: { type: 'string', maxLength: 300 },
    sequenceOrder: {
      custom: (value) => (Number.isInteger(value) && value >= 0 ? null : 'sequenceOrder must be a positive integer or zero.')
    }
  });
};

const validateTripAndDates = async (tripId, date) => {
  const trip = await tripModel.findById(tripId);
  if (!trip) {
    throw new NotFoundError('Trip not found.');
  }

  const activityDate = new Date(date);
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  if (activityDate < startDate || activityDate > endDate) {
    throw new ValidationError('Date must fall within the trip dates.', [{
      field: 'date',
      message: `Date must be between ${trip.startDate} and ${trip.endDate}.`
    }]);
  }
  return trip;
};

const getAllItineraries = async (tripId) => {
  const id = toPositiveInteger(tripId, 'tripId');
  const trip = await tripModel.findById(id);
  if (!trip) {
    throw new NotFoundError('Trip not found.');
  }
  const itineraries = await itineraryModel.findAllByTripId(id);
  return { itineraries, trip };
};

const getItineraryById = async (id) => {
  const activityId = toPositiveInteger(id, 'id');
  const itinerary = await itineraryModel.findById(activityId);

  if (!itinerary) {
    throw new NotFoundError('Itinerary entry not found.');
  }

  return { itinerary };
};

const createItinerary = async (payload) => {
  const activity = normalizePayload(payload);
  validatePayload(activity);
  await validateTripAndDates(activity.tripId, activity.date);

  const created = await itineraryModel.create(activity);
  return { itinerary: created };
};

const updateItinerary = async (id, payload) => {
  const activityId = toPositiveInteger(id, 'id');
  const existing = await itineraryModel.findById(activityId);

  if (!existing) {
    throw new NotFoundError('Itinerary entry not found.');
  }

  const activity = normalizePayload(payload);
  // Trip ID cannot be changed, keep existing
  activity.tripId = existing.tripId;
  validateUpdatePayload(activity);
  await validateTripAndDates(activity.tripId, activity.date);

  await itineraryModel.update(activityId, activity);
  const updated = await itineraryModel.findById(activityId);
  return { itinerary: updated };
};

const deleteItinerary = async (id) => {
  const activityId = toPositiveInteger(id, 'id');
  const existing = await itineraryModel.findById(activityId);

  if (!existing) {
    throw new NotFoundError('Itinerary entry not found.');
  }

  await itineraryModel.remove(activityId);
  return { success: true };
};

module.exports = {
  getAllItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary
};
