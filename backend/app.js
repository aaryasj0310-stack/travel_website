const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const tripRoutes = require('./routes/trip.routes');
const { tripBudgetRouter, budgetRouter } = require('./routes/budget.routes');
const expenseRoutes = require('./routes/expense.routes');
const { router: itineraryRouter, tripItineraryRouter } = require('./routes/itinerary.routes');
const notFound = require('./middleware/not-found.middleware');
const errorHandler = require('./middleware/error-handler.middleware');
const { APP } = require('./utils/constants');

const app = express();

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.use(cors({
  origin: env.corsOrigin,
  credentials: true
}));

app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: env.session.name,
  secret: env.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: env.session.maxAgeMs
  }
}));

app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/backend-public', express.static(path.join(__dirname, 'public')));

app.use(`${APP.API_PREFIX}/health`, healthRoutes);
app.use(`${APP.API_PREFIX}/trips`, tripRoutes);
app.use(`${APP.API_PREFIX}/trips/:tripId/budget`, tripBudgetRouter);
app.use(`${APP.API_PREFIX}/trips/:tripId/itineraries`, tripItineraryRouter);
app.use(`${APP.API_PREFIX}/budgets`, budgetRouter);
app.use(`${APP.API_PREFIX}/expenses`, expenseRoutes);
app.use(`${APP.API_PREFIX}/itineraries`, itineraryRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
