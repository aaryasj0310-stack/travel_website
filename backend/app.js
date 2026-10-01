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
const authRoutes = require('./routes/auth.routes');
const { requireAuth, protectMutation } = require('./middleware/auth.middleware');

const app = express();

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.use(cors({
  origin: env.corsOrigin,
  credentials: true
}));

app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin' });
  next();
});
app.use(express.json({ limit: '32kb' }));
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

app.get(['/dashboard.html', '/trips.html', '/itinerary.html', '/budget.html', '/expenses.html', '/profile.html'], (req, res, next) => {
  if (!req.session.userId) return res.redirect(`/login.html?next=${encodeURIComponent(req.originalUrl)}`);
  res.set('Cache-Control', 'no-store');
  next();
});
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/backend-public', express.static(path.join(__dirname, 'public')));

app.use(`${APP.API_PREFIX}/health`, healthRoutes);
app.use(APP.API_PREFIX, (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use(`${APP.API_PREFIX}/auth`, protectMutation, authRoutes);
app.use(APP.API_PREFIX, requireAuth);
app.use(APP.API_PREFIX, protectMutation);
app.use(`${APP.API_PREFIX}/dashboard`, require('./routes/dashboard.routes'));
app.use(`${APP.API_PREFIX}/trips`, tripRoutes);
app.use(`${APP.API_PREFIX}/trips/:tripId/budget`, tripBudgetRouter);
app.use(`${APP.API_PREFIX}/trips/:tripId/itineraries`, tripItineraryRouter);
app.use(`${APP.API_PREFIX}/budgets`, budgetRouter);
app.use(`${APP.API_PREFIX}/expenses`, expenseRoutes);
app.use(`${APP.API_PREFIX}/itineraries`, itineraryRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
