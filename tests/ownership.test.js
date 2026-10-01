const { test } = require('node:test');
const assert = require('node:assert/strict');
const tripModel = require('../backend/models/trip.model');
const service = require('../backend/services/trip.service');
test('trip reads and writes enforce ownership; forged create owner is ignored', async (t) => {
  t.mock.method(tripModel, 'findById', async () => ({ id: 7, userId: 2 }));
  t.mock.method(tripModel, 'create', async value => value);
  await assert.rejects(service.getTripById(7, 1), { statusCode: 404 });
  const trip = await service.createTrip({ userId: 2, destination: 'Goa', startDate: '2026-10-01', endDate: '2026-10-03', numTravelers: 2 }, 1);
  assert.equal(trip.userId, 1);
});
