// Opt-in: node tests/live-mysql.js. Uses the configured MySQL database and
// creates only unique test users; their cascading data is removed in finally.
process.env.NODE_ENV = 'test';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const app = require('../backend/app');
const database = require('../backend/config/database');
const { removeTestUser } = require('./live.model');
const created = [];
const server = app.listen(0, '127.0.0.1');

(async () => {
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const client = () => {
    let cookie = '', csrf = '';
    return async (path, method = 'GET', body, expected = 200) => {
      const response = await fetch(base + '/api/v1' + path, { method, headers: { Cookie: cookie, 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, ...(body ? { body: JSON.stringify(body) } : {}) });
      if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
      const result = await response.json();
      assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(result)}`);
      assert.equal(result.success, expected < 400);
      if (result.data?.csrfToken) csrf = result.data.csrfToken;
      return result.data;
    };
  };
  const alice = client(), bob = client();
  const password = crypto.randomBytes(18).toString('hex');
  const stamp = crypto.randomUUID();
  try {
    await database.testConnection();
    for (const [index, call] of [alice, bob].entries()) {
      await call('/auth/csrf');
      const email = `voyage-qa-${stamp}-${index}@example.test`;
      const data = await call('/auth/register', 'POST', { name: 'Voyage QA temporary', email, password, confirmPassword: password }, 201);
      created.push({ id: data.user.id, email });
      assert.equal(data.user.password_hash, undefined);
      assert.equal((await call('/auth/me')).user.email, email);
    }
    console.log('PASS: live registration, current user, session cookies');
    const today = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.parse(today) + 2 * 86400000).toISOString().slice(0, 10);
    const payload = { destination: 'Voyage QA temporary journey', startDate: today, endDate: end, numTravelers: 2, userId: created[1].id };
    const { trip } = await alice('/trips', 'POST', payload, 201);
    assert.equal(trip.userId, created[0].id);
    await alice('/trips/' + trip.id, 'PUT', { ...payload, destination: 'Voyage QA edited journey' });
    assert.equal((await alice('/trips/' + trip.id)).trip.destination, 'Voyage QA edited journey');
    const { categories } = await alice('/budgets/categories');
    assert.equal(categories.length, 6, 'Install database/categories.sql before this live test');
    const food = categories.find(c => c.slug === 'food');
    const allocations = categories.map(c => ({ categoryId: c.id, allocatedAmount: c.id === food.id ? '0.30' : '0.00' }));
    const { budget } = await alice('/trips/' + trip.id + '/budget', 'POST', { totalAmount: '1.00', allocations }, 201);
    await alice('/trips/' + trip.id + '/budget', 'PUT', { totalAmount: '2.00', allocations });
    const activity = { tripId: trip.id, title: 'Morning walk', location: 'QA location', date: today, startTime: '09:00', endTime: '10:00' };
    const { itinerary } = await alice('/itineraries', 'POST', activity, 201);
    await alice('/itineraries/' + itinerary.id, 'PUT', { ...activity, title: 'Edited morning walk' });
    assert.equal((await alice('/trips/' + trip.id + '/itineraries')).itineraries[0].title, 'Edited morning walk');
    const expense = { budgetId: budget.id, categoryId: food.id, amount: '0.10', expenseDate: today, description: 'QA tea' };
    const first = await alice('/expenses', 'POST', expense, 201);
    const second = await alice('/expenses', 'POST', { ...expense, amount: '0.20' }, 201);
    assert.equal(second.summary.totalSpent, '0.30');
    const updated = await alice('/expenses/' + first.expense.id, 'PUT', { ...expense, amount: '2.00' });
    assert.equal(updated.summary.remainingBudget, '-0.20');
    const overview = await alice('/dashboard?tripId=' + trip.id);
    assert.equal(overview.finance.spent, '2.20');
    assert.equal(overview.unplannedDays, 2);
    assert.equal(overview.finance.categories.find(c => c.categoryId === food.id).health, 'over');
    console.log('PASS: live trip, itinerary, budget, expense create/read/update; exact totals and dashboard');
    const paths = ['/trips/' + trip.id, '/trips/' + trip.id + '/budget', '/trips/' + trip.id + '/itineraries', '/expenses/' + first.expense.id, '/itineraries/' + itinerary.id, '/dashboard?tripId=' + trip.id, '/expenses?budgetId=' + budget.id];
    for (const path of paths) await bob(path, 'GET', null, 404);
    for (const [path, body] of [['/trips/' + trip.id, payload], ['/expenses/' + first.expense.id, expense], ['/itineraries/' + itinerary.id, activity]]) {
      await bob(path, 'PUT', body, 404);
      await bob(path, 'DELETE', null, 404);
    }
    await bob('/expenses', 'POST', expense, 404);
    await bob('/itineraries', 'POST', activity, 404);
    assert.equal((await bob('/trips?userId=' + created[0].id)).trips.length, 0);
    console.log('PASS: live cross-user reads/writes/deletes and forged owner rejected');
    await alice('/expenses/' + first.expense.id, 'DELETE');
    assert.equal((await alice('/dashboard?tripId=' + trip.id)).finance.spent, '0.20');
    await alice('/expenses/' + second.expense.id, 'DELETE');
    await alice('/itineraries/' + itinerary.id, 'DELETE');
    await alice('/trips/' + trip.id + '/budget', 'DELETE');
    await alice('/trips/' + trip.id, 'DELETE');
    assert.equal((await alice('/trips')).trips.length, 0);
    await alice('/auth/profile', 'PUT', { name: 'QA updated name', email: created[0].email });
    await alice('/auth/password', 'PUT', { currentPassword: password, newPassword: password + 'x', confirmPassword: password + 'x' });
    await alice('/auth/logout', 'POST');
    await alice('/auth/me', 'GET', null, 401);
    await alice('/auth/csrf');
    await alice('/auth/login', 'POST', { email: created[0].email, password: password + 'x' });
    assert.equal((await alice('/auth/me')).user.name, 'QA updated name');
    console.log('PASS: live delete flows, profile, password change, logout and login');
  } finally {
    for (const user of created) await removeTestUser(user.id, user.email);
    console.log(`Cleaned up ${created.length} temporary QA accounts and cascading records.`);
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await database.pool.end();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
