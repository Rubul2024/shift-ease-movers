const mongoose = require('mongoose');

const STATUSES = ['Confirmed', 'Vehicle Assigned', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled'];

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    pickupArea: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
    dropArea: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
    pickupAddress: { type: String, required: true, trim: true },
    dropAddress: { type: String, required: true, trim: true },
    movingDate: { type: Date, required: true },
    timeSlot: { type: String, default: '08:00 - 11:00' },
    houseType: { type: String, required: true },
    vehicleType: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    pickupFloor: { type: Number, default: 0 },
    dropFloor: { type: Number, default: 0 },
    liftAvailable: { type: Boolean, default: true },
    premiumPacking: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    breakdown: { type: Object },
    status: { type: String, enum: STATUSES, default: 'Confirmed' },
    history: [
      {
        status: String,
        note: String,
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
