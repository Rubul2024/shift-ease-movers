/**
 * Quotation engine. All prices in INR.
 * The same rules are mirrored in client/src/utils/pricing.js for instant, offline estimates;
 * the server is always the source of truth when a quote or booking is saved.
 */

const { httpError } = require('./validate');

const VEHICLES = {
  'Mini Truck': { base: 1500, perKm: 22, fits: 'Up to 1 BHK' },
  Tempo: { base: 2500, perKm: 30, fits: '1-2 BHK' },
  'Large Truck': { base: 4500, perKm: 42, fits: '2-3 BHK' },
  Container: { base: 8000, perKm: 58, fits: '3 BHK+ / Office' },
};

const HOUSE_TYPES = {
  '1 RK': 1500,
  '1 BHK': 3000,
  '2 BHK': 5500,
  '3 BHK': 8000,
  '4 BHK+': 11000,
  Office: 12000,
};

const TIME_SLOTS = ['07:00 - 10:00', '10:00 - 13:00', '13:00 - 16:00', '16:00 - 19:00'];

const FLOOR_RATE = 350; // per floor, per side, when no lift
const PREMIUM_PACKING_RATE = 0.4; // +40% of labour & packing
const INSURANCE_RATE = 0.03; // 3% of the move subtotal
const GST_RATE = 0.18;
const MIN_DISTANCE_KM = 5;

const round = (n) => Math.round(n);

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/** Road distance estimate between two areas (haversine x 1.3 road factor). */
function distanceBetween(a, b) {
  if (!a || !b) return MIN_DISTANCE_KM;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const km = 2 * R * Math.asin(Math.sqrt(h)) * 1.3;
  return Math.max(MIN_DISTANCE_KM, round(km));
}

function calculateQuote({
  vehicleType,
  houseType,
  distanceKm,
  pickupFloor = 0,
  dropFloor = 0,
  liftAvailable = true,
  premiumPacking = false,
  insurance = false,
}) {
  const vehicle = Object.hasOwn(VEHICLES, vehicleType) ? VEHICLES[vehicleType] : undefined;
  const labour = Object.hasOwn(HOUSE_TYPES, houseType) ? HOUSE_TYPES[houseType] : undefined;
  if (!vehicle) throw httpError(400, 'Please choose a valid vehicle type');
  if (labour === undefined) throw httpError(400, 'Please choose a valid home size');

  const km = Math.max(MIN_DISTANCE_KM, Number(distanceKm) || 0);
  const vehicleBase = vehicle.base;
  const distanceCharge = round(km * vehicle.perKm);
  const labourPacking = labour;
  const floors = liftAvailable ? 0 : (Number(pickupFloor) || 0) + (Number(dropFloor) || 0);
  const floorCharge = floors * FLOOR_RATE;
  const premium = premiumPacking ? round(labour * PREMIUM_PACKING_RATE) : 0;

  const beforeInsurance = vehicleBase + distanceCharge + labourPacking + floorCharge + premium;
  const insuranceCharge = insurance ? round(beforeInsurance * INSURANCE_RATE) : 0;
  const subtotal = beforeInsurance + insuranceCharge;
  const gst = round(subtotal * GST_RATE);

  return {
    vehicleBase,
    distanceCharge,
    labourPacking,
    floorCharge,
    premiumPacking: premium,
    insurance: insuranceCharge,
    subtotal,
    gst,
    total: subtotal + gst,
  };
}

module.exports = { VEHICLES, HOUSE_TYPES, TIME_SLOTS, calculateQuote, distanceBetween };
