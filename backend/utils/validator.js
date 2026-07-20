const { ValidationError } = require('./errors');

const isEmpty = (value) => (
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '')
);

const validate = (data, schema) => {
  const errors = [];

  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];

    if (rules.required && isEmpty(value)) {
      errors.push({ field, message: `${field} is required.` });
      return;
    }

    if (isEmpty(value)) {
      return;
    }

    if (rules.type && typeof value !== rules.type) {
      errors.push({ field, message: `${field} must be a ${rules.type}.` });
      return;
    }

    if (typeof value === 'string') {
      const trimmedLength = value.trim().length;

      if (rules.minLength && trimmedLength < rules.minLength) {
        errors.push({ field, message: `${field} must be at least ${rules.minLength} characters.` });
      }

      if (rules.maxLength && trimmedLength > rules.maxLength) {
        errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters.` });
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({ field, message: rules.patternMessage || `${field} is invalid.` });
      }
    }

    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push({ field, message: `${field} must be at least ${rules.min}.` });
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push({ field, message: `${field} must be at most ${rules.max}.` });
      }
    }

    if (Array.isArray(rules.allowedValues) && !rules.allowedValues.includes(value)) {
      errors.push({ field, message: `${field} contains an unsupported value.` });
    }

    if (typeof rules.custom === 'function') {
      const customMessage = rules.custom(value, data);
      if (customMessage) {
        errors.push({ field, message: customMessage });
      }
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(undefined, errors);
  }

  return data;
};

module.exports = {
  validate,
  isEmpty
};
