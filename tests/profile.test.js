const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
test('profile cannot be edited before the account details finish loading', async () => {
  let resolve;
  const ready = new Promise(done => { resolve = done; });
  const controls = [{ disabled: false, value: '' }, { disabled: false, value: '' }];
  const form = { addEventListener() {} };
  const sandbox = { document: { querySelectorAll: () => controls }, Voyage: { ready, notify() {}, $: selector => selector === '#name' ? controls[0] : selector === '#email' ? controls[1] : form } };
  vm.runInNewContext(fs.readFileSync('frontend/js/profile.js', 'utf8'), sandbox);
  assert.ok(controls.every(control => control.disabled));
  resolve({ name: 'Traveler', email: 'traveler@example.test' });
  await ready;
  assert.equal(controls[0].value, 'Traveler');
  assert.equal(controls[1].value, 'traveler@example.test');
  assert.ok(controls.every(control => !control.disabled));
});
