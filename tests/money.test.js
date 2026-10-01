const { test } = require('node:test');
const assert = require('node:assert/strict');
test('money uses exact paise, rejects precision loss and preserves negative balances', () => {
  const money = require('../backend/utils/money');
  assert.equal(money.decimal(money.paise('0.10') + money.paise('0.20')), '0.30');
  assert.equal(money.decimal(money.paise('10.00') - money.paise('12.50')), '-2.50');
  for (const value of ['1.001', '-1', 'NaN', '1e3', '', null, '10000000000']) assert.throws(() => money.paise(value));
});
