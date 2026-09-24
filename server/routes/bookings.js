const router = require('express').Router();
const Booking = require('../models/Booking');
const Area = require('../models/Area');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');
const { calculateQuote, distanceBetween } = require('../utils/pricing');

const POPULATE = ['pickupArea dropArea', 'name city'];

// POST /api/bookings -> customer books a moving cab instantly
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const b = req.body;
    const [pickup, drop] = await Promise.all([Area.findById(b.pickupArea), Area.findById(b.dropArea)]);
    if (!pickup || !drop || !pickup.isActive || !drop.isActive) {
      return res.status(400).json({ message: 'Cabs are not available in the selected area' });
    }
    if (!pickup.vehicleTypes.includes(b.vehicleType)) {
      return res.status(400).json({
        message: `${b.vehicleType} is not available in ${pickup.name}. Available: ${pickup.vehicleTypes.join(', ')}`,
      });
    }
    if (pickup.availableCabs < 1) {
      return res.status(409).json({ message: `All cabs in ${pickup.name} are busy. Please try another slot.` });
    }
    const date = new Date(b.movingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(date.getTime()) || date < today) {
      return res.status(400).json({ message: 'Please choose today or a future date' });
    }

    const distanceKm = distanceBetween(pickup, drop);
    const breakdown = calculateQuote({ ...b, distanceKm });

    const booking = await Booking.create({
      user: req.user._id,
      contactName: b.contactName || req.user.name,
      contactPhone: b.contactPhone || req.user.phone,
      pickupArea: pickup._id,
      dropArea: drop._id,
      pickupAddress: b.pickupAddress,
      dropAddress: b.dropAddress,
      movingDate: date,
      timeSlot: b.timeSlot,
      houseType: b.houseType,
      vehicleType: b.vehicleType,
      distanceKm,
      pickupFloor: b.pickupFloor,
      dropFloor: b.dropFloor,
      liftAvailable: b.liftAvailable,
      premiumPacking: b.premiumPacking,
      insurance: b.insurance,
      amount: breakdown.total,
      breakdown,
      status: 'Confirmed',
      history: [{ status: 'Confirmed', note: 'Booking confirmed instantly online' }],
    });
    res.status(201).json(await booking.populate(...POPULATE));
  })
);

// GET /api/bookings/mine
router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    res.json(await Booking.find({ user: req.user._id }).populate(...POPULATE).sort({ createdAt: -1 }));
  })
);

// GET /api/bookings/track/:bookingId -> public tracking
router.get(
  '/track/:bookingId',
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId.toUpperCase() })
      .populate(...POPULATE)
      .select('bookingId pickupArea dropArea movingDate timeSlot vehicleType houseType status history createdAt');
    if (!booking) return res.status(404).json({ message: 'No booking found with this ID' });
    res.json(booking);
  })
);

// PUT /api/bookings/:id/cancel -> customer cancels own booking
router.put(
  '/:id/cancel',
  protect,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!['Confirmed', 'Vehicle Assigned'].includes(booking.status)) {
      return res.status(400).json({ message: 'This booking can no longer be cancelled' });
    }
    booking.status = 'Cancelled';
    booking.history.push({ status: 'Cancelled', note: 'Cancelled by customer' });
    await booking.save();
    res.json(await booking.populate(...POPULATE));
  })
);

// ---------- Admin ----------
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const filter = req.query.status ? { status: req.query.status } : {};
    res.json(
      await Booking.find(filter).populate(...POPULATE).populate('user', 'name email').sort({ createdAt: -1 })
    );
  })
);

router.put(
  '/:id/status',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    if (!Booking.STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = status;
    booking.history.push({ status, note });
    await booking.save();
    res.json(await booking.populate(...POPULATE));
  })
);

module.exports = router;
