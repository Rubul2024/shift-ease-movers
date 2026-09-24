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
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true, match: [/^S+@S+.S+$/, 'Please enter a valid email'] },
    phone: { type: String, required: [true, 'Phone is required'], trim: true, maxlength: 20 },
    fromArea: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
    toArea: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
    movingDate: { type: Date, required: [true, 'Moving date is required'] },
    houseType: { type: String, required: true },
    vehicleType: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    pickupFloor: { type: Number, default: 0, min: 0, max: 100 },
    dropFloor: { type: Number, default: 0, min: 0, max: 100 },
    liftAvailable: { type: Boolean, default: true },
    premiumPacking: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    notes: { type: String, trim: true, maxlength: 2000 },
    breakdown: breakdownSchema,
    status: { type: String, enum: ['New', 'Sent', 'Accepted', 'Rejected'], default: 'New' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quote', quoteSchema);
