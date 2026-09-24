const mongoose = require('mongoose');

const STATUSES = ['Confirmed', 'Vehicle Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled'];

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactName: { type: String, required: [true, 'Contact name is required'], trim: true, maxlength: 100 },
    contactPhone: { type: String, required: [true, 'Contact phone is required'], trim: true, maxlength: 20 },
    pickupArea: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
    dropArea: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
    pickupAddress: { type: String, required: [true, 'Pickup address is required'], trim: true, maxlength: 300 },
    dropAddress: { type: String, required: [true, 'Drop address is required'], trim: true, maxlength: 300 },
    movingDate: { type: Date, required: true },
    timeSlot: { type: String, default: '07:00 - 10:00', maxlength: 30 },
    houseType: { type: String, required: true },
    vehicleType: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    pickupFloor: { type: Number, default: 0, min: 0, max: 100 },
    dropFloor: { type: Number, default: 0, min: 0, max: 100 },
    liftAvailable: { type: Boolean, default: true },
    premiumPacking: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    breakdown: { type: Object },
    status: { type: String, enum: STATUSES, default: 'Confirmed' },
    history: [
      {
        status: String,
        note: { type: String, maxlength: 500 },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

bookingSchema.pre('validate', function setBookingId(next) {
  if (!this.bookingId) {
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    this.bookingId = `SE${Date.now().toString().slice(-5)}${rand}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
module.exports.STATUSES = STATUSES;
