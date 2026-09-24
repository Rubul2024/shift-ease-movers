// Mirror of server/utils/pricing.js so the price updates instantly as the customer types.
// The server recalculates on save, so these numbers are never trusted blindly.
export const VEHICLES = {
  'Mini Truck': { base: 1500, perKm: 22, fits: 'Up to 1 BHK' },
  Tempo: { base: 2500, perKm: 30, fits: '1-2 BHK' },
  'Large Truck': { base: 4500, perKm: 42, fits: '2-3 BHK' },
  Container: { base: 8000, perKm: 58, fits: '3 BHK+ / Office' },
};

export const HOUSE_TYPES = {
  '1 RK': 1500,
  '1 BHK': 3000,
  '2 BHK': 5500,
  '3 BHK': 8000,
  '4 BHK+': 11000,
  Office: 12000,
};

export const SUGGESTED_VEHICLE = {
  '1 RK': 'Mini Truck',
  '1 BHK': 'Mini Truck',
  '2 BHK': 'Tempo',
  '3 BHK': 'Large Truck',
  '4 BHK+': 'Container',
  Office: 'Container',
};

export const TIME_SLOTS = ['07:00 - 10:00', '10:00 - 13:00', '13:00 - 16:00', '16:00 - 19:00'];

const FLOOR_RATE = 350;
const MIN_KM = 5;
const round = Math.round;
const toRad = (d) => (d * Math.PI) / 180;

export function distanceBetween(a, b) {
  if (!a || !b) return MIN_KM;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.max(MIN_KM, round(2 * 6371 * Math.asin(Math.sqrt(h)) * 1.3));
}

export function calculateQuote({ vehicleType, houseType, distanceKm, pickupFloor = 0, dropFloor = 0, liftAvailable = true, premiumPacking = false, insurance = false }) {
  const vehicle = VEHICLES[vehicleType];
  const labour = HOUSE_TYPES[houseType];
  if (!vehicle || labour === undefined) return null;
  const km = Math.max(MIN_KM, Number(distanceKm) || 0);
  const distanceCharge = round(km * vehicle.perKm);
  const floorCharge = liftAvailable ? 0 : ((Number(pickupFloor) || 0) + (Number(dropFloor) || 0)) * FLOOR_RATE;
  const premium = premiumPacking ? round(labour * 0.4) : 0;
  const before = vehicle.base + distanceCharge + labour + floorCharge + premium;
  const ins = insurance ? round(before * 0.03) : 0;
  const subtotal = before + ins;
  const gst = round(subtotal * 0.18);
  return {
    vehicleBase: vehicle.base,
    distanceCharge,
    labourPacking: labour,
    floorCharge,
    premiumPacking: premium,
    insurance: ins,
    subtotal,
    gst,
    total: subtotal + gst,
  };
}
