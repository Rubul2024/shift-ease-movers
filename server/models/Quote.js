const mongoose = require('mongoose');

const breakdownSchema = new mongoose.Schema(
  {
    vehicleBase: Number,
    distanceCharge: Number,
    labourPacking: Number,
    floorCharge: Number,
    premiumPacking: Number,
    insurance: Number,
    subtotal: Number,
    gst: Number,
    total: Number,
  },
  { _id: false }
);

const quoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    fromArea: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
    toArea: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
    movingDate: { type: Date, required: true },
    houseType: { type: String, required: true },
    vehicleType: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    pickupFloor: { type: Number, default: 0 },
    dropFloor: { type: Number, default: 0 },
    liftAvailable: { type: Boolean, default: true },
    premiumPacking: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    notes: { type: String, trim: true },
    breakdown: breakdownSchema,
    status: { type: String, enum: ['New', 'Sent', 'Accepted', 'Rejected'], default: 'New' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quote', quoteSchema);
