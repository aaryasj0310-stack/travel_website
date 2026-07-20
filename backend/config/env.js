require('dotenv').config();

const REQUIRED_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_NAME',
  'SESSION_SECRET',
  'SESSION_NAME',
  'SESSION_MAX_AGE_MS',
  'CORS_ORIGIN'
];

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const validateRequiredEnv = () => {
  const missingVars = REQUIRED_ENV_VARS.filter((key) => {
    const value = process.env[key];
    return value === undefined || value === null || value === '';
  });

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

validateRequiredEnv();

const env = {
  nodeEnv: process.env.NODE_ENV,
  port: toNumber(process.env.PORT, 3000),
  corsOrigin: process.env.CORS_ORIGIN,
  database: {
    host: process.env.DB_HOST,
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME
  },
  session: {
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    maxAgeMs: toNumber(process.env.SESSION_MAX_AGE_MS, 86400000)
  }
};

module.exports = env;
