const isValidDateString = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(value)) {
    return false;
  }
  if (Number(value.slice(0, 4)) < 1000) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const isValidTimeString = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
};

module.exports = {
  isValidDateString,
  isValidTimeString,
  todayInIndia: () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
  tripStatus: (trip, today = module.exports.todayInIndia()) => today < trip.startDate ? 'upcoming' : today > trip.endDate ? 'completed' : 'ongoing'
};
