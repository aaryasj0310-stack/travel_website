const trips = require('../models/trip.model');
const { NotFoundError, ValidationError, UnauthorizedError } = require('../utils/errors');
const ownedTrip = async (id, userId) => {
  if (!Number.isSafeInteger(Number(userId)) || Number(userId) < 1) throw new UnauthorizedError();
  if (!Number.isSafeInteger(Number(id)) || Number(id) < 1) throw new ValidationError('Invalid trip ID.');
  const trip = await trips.findById(Number(id));
  if (!trip || String(trip.userId) !== String(userId)) throw new NotFoundError('Trip not found.');
  return trip;
};
module.exports = { ownedTrip };
