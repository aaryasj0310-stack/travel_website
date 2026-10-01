process.env.NODE_ENV = 'test';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../backend/app');
const database = require('../backend/config/database');

test('private API requires a session, never a client userId', async () => {
  const server = app.listen(0);
  try {
    const base = `http://127.0.0.1:${server.address().port}/api/v1`;
    for (const path of ['/trips?userId=1', '/budgets', '/expenses', '/itineraries/1', '/trips/1/budget']) {
      const response = await fetch(base + path);
      assert.equal(response.status, 401, path);
      assert.equal((await response.json()).success, false);
    }
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await database.pool.end();
  }
});
