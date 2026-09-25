/**
 * Real-time slot availability: each area can run `availableCabs` moves per time slot per day.
 * "Today" and "slot already started" are judged in the business time zone (BUSINESS_TZ,
 * default Asia/Kolkata), so a UTC server still behaves correctly for Indian customers.
 */
const Booking = require('../models/Booking');
const { TIME_SLOTS } = require('./pricing');

const TZ = process.env.BUSINESS_TZ || 'Asia/Kolkata';

/** Current date (YYYY-MM-DD) and hour in the business time zone. */
function businessNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

const slotStartHour = (slot) => Number(slot.slice(0, 2));

/** Moving dates are stored as UTC midnight of the chosen calendar day. */
const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

/**
 * Returns [{ slot, booked, remaining, available, reason }] for an area on a YYYY-MM-DD day.
 * A slot closes once it has started (same-day bookings need the slot to be at least 1 hour away).
 */
async function slotAvailability(area, day) {
  const start = new Date(`${day}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const counts = await Booking.aggregate([
    { $match: { pickupArea: area._id, movingDate: { $gte: start, $lt: end }, status: { $ne: 'Cancelled' } } },
    { $group: { _id: '$timeSlot', n: { $sum: 1 } } },
  ]);
  const booked = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  const now = businessNow();
  const capacity = area.isActive ? area.availableCabs || 0 : 0;

  return TIME_SLOTS.map((slot) => {
    const used = booked[slot] || 0;
    const remaining = Math.max(0, capacity - used);
    let reason = '';
    if (!area.isActive) reason = 'Area paused';
    else if (day < now.date || (day === now.date && slotStartHour(slot) <= now.hour)) reason = 'Slot has started';
    else if (remaining === 0) reason = 'Fully booked';
    return { slot, booked: used, remaining, available: !reason, reason };
  });
}

module.exports = { slotAvailability, businessNow, dayKey };
