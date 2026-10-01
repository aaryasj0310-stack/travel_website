const trips = require('./trip.service');
const budgets = require('../models/budget.model');
const itineraries = require('../models/itinerary.model');
const { ownedTrip } = require('./ownership.service');
const { paise, decimal, sum } = require('../utils/money');
const { todayInIndia, tripStatus: statusFor } = require('../utils/date-time');
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const financials = (budget, trip, today) => {
  if (!budget) return null;
  const total = paise(budget.totalAmount);
  const allocated = sum(budget.allocations.map(a => a.allocatedAmount));
  const spent = sum(budget.allocations.map(a => a.spentAmount));
  const largestCategory = budget.allocations.reduce((largest, category) => paise(category.spentAmount) > paise(largest?.spentAmount || '0') ? category : largest, null);
  const duration = daysBetween(trip.startDate, trip.endDate) + 1;
  const elapsed = Math.max(0, Math.min(duration, daysBetween(trip.startDate, today) + 1));
  const remainingDays = today > trip.endDate ? 0 : today < trip.startDate ? duration : daysBetween(today, trip.endDate) + 1;
  return {
    largestCategory,
    total: decimal(total), allocated: decimal(allocated), unallocated: decimal(total - allocated), spent: decimal(spent), remaining: decimal(total - spent),
    consumedPercent: total ? Math.round(spent / total * 100) : 0,
    perTraveler: decimal(Math.floor(total / trip.numTravelers)), perDay: decimal(Math.floor(total / duration)),
    remainingPerDay: remainingDays ? decimal(Math.floor((total - spent) / remainingDays)) : null,
    recordedPerElapsedDay: elapsed ? decimal(Math.floor(spent / elapsed)) : null,
    remainingDays, elapsedPercent: Math.round(elapsed / duration * 100),
    categories: budget.allocations.map(a => {
      const allocation = paise(a.allocatedAmount), actual = paise(a.spentAmount);
      return { ...a, remaining: decimal(allocation - actual), consumedPercent: allocation ? Math.round(actual / allocation * 100) : null, health: actual > allocation ? 'over' : allocation > 0 && actual / allocation >= .8 ? 'near' : 'within' };
    })
  };
};
const overview = async (userId, selectedId) => {
  const today = todayInIndia();
  const allTrips = (await trips.getAllTrips({ userId })).map(trip => ({ ...trip, status: statusFor(trip, today) }));
  const selected = selectedId ? await ownedTrip(selectedId, userId) : allTrips.find(t => t.status === 'ongoing') || allTrips.find(t => t.status === 'upcoming') || allTrips.at(-1);
  if (!selected) return { trips: [], trip: null, today };
  const trip = { ...selected, status: statusFor(selected, today) };
  const [budget, activities] = await Promise.all([budgets.findByTripId(trip.id), itineraries.findAllByTripId(trip.id)]);
  const duration = daysBetween(trip.startDate, trip.endDate) + 1;
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  const inRange = activities.filter(a => a.date >= trip.startDate && a.date <= trip.endDate);
  return { trips: allTrips, trip, today, duration, daysUntil: Math.max(0, daysBetween(today, trip.startDate)),
    finance: financials(budget, trip, today), activityCount: activities.length,
    unplannedDays: duration - new Set(inRange.map(a => a.date)).size,
    outsideDateCount: activities.length - inRange.length,
    todayActivities: activities.filter(a => a.date === today),
    nextActivity: activities.find(a => a.date > today || (a.date === today && a.startTime >= time)) || null
  };
};
module.exports = { overview, financials, daysBetween, statusFor, todayInIndia };
