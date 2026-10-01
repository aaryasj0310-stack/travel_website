const { ValidationError } = require('./errors');
const paise = (value, field = 'amount') => {
  const text = String(value);
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(text)) throw new ValidationError(`${field} must be a non-negative amount with at most two decimal places.`);
  const [whole, fraction = ''] = text.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
};
const decimal = (value) => {
  if (!Number.isSafeInteger(value)) throw new ValidationError('Money total exceeds the supported range.');
  const absolute = Math.abs(value);
  return `${value < 0 ? '-' : ''}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}`;
};
const sum = (values) => values.reduce((total, value) => total + paise(value), 0);
module.exports = { paise, decimal, sum };
