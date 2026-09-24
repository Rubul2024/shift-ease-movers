const mongoose = require('mongoose');

const VEHICLE_TYPES = ['Mini Truck', 'Tempo', 'Large Truck', 'Container'];

// A serviceable area (zone) defined by the admin where moving cabs can be booked.
const areaSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Area name is required'], trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { type: String, trim: true },
    pincodes: [{ type: String, trim: true }],
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    vehicleTypes: {
      type: [{ type: String, enum: VEHICLE_TYPES }],
      default: ['Mini Truck', 'Tempo'],
    },
    availableCabs: { type: Number, default: 5, min: 0 },
    isActive: { type: Boolean, default: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

areaSchema.index({ name: 1, city: 1 }, { unique: true });

module.exports = mongoose.model('Area', areaSchema);
module.exports.VEHICLE_TYPES = VEHICLE_TYPES;
