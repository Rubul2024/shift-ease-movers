const router = require('express').Router();
const Booking = require('../models/Booking');
const Area = require('../models/Area');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');
const { calculateQuote, distanceBetween, TIME_SLOTS } = require('../utils/pricing');
const { escapeRegex, parseMoveDate } = require('../utils/validate');
const { sendMail, templates, siteUrl } = require('../utils/mailer');

const POPULATE = ['pickupArea dropArea', 'name city state'];

// POST /api/bookings -> customer books a moving cab instantly
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (!b.pickupArea || !b.dropArea) {
      return res.status(400).json({ message: 'Please choose pickup and drop areas' });
    }
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
    const date = parseMoveDate(b.movingDate);
    const timeSlot = b.timeSlot === undefined ? TIME_SLOTS[0] : b.timeSlot;
    if (!TIME_SLOTS.includes(timeSlot)) return res.status(400).json({ message: 'Please choose a valid time slot' });

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
      timeSlot,
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
    await booking.populate(...POPULATE);
    sendMail({ to: req.user.email, ...templates.bookingConfirmed(booking, req.user, siteUrl(req)) });
    res.status(201).json(booking);
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

// GET /api/bookings/track/:bookingId -> public tracking (no personal details)
router.get(
  '/track/:bookingId',
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({ bookingId: String(req.params.bookingId).trim().toUpperCase() })
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
// GET /api/bookings?status=&q=  (q matches booking ID, contact name or phone)
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
      filter.$or = [{ bookingId: rx }, { contactName: rx }, { contactPhone: rx }];
    }
    res.json(
      await Booking.find(filter).populate(...POPULATE).populate('user', 'name email').sort({ createdAt: -1 }).limit(500)
    );
  })
);

// GET /api/bookings/:id -> full booking (receipt). Owner or admin only.
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate(...POPULATE).populate('user', 'name email');
    const isOwner = booking && booking.user && String(booking.user._id) === String(req.user._id);
    if (!booking || (!isOwner && req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  })
);

router.put(
  '/:id/status',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const note = typeof req.body.note === 'string' ? req.body.note.trim().slice(0, 500) : undefined;
    if (!Booking.STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const booking = await Booking.findById(req.params.id).populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const changed = booking.status !== status;
    booking.status = status;
    booking.history.push({ status, note: note || undefined });
    await booking.save();
    await booking.populate(...POPULATE);
    if (changed && booking.user && booking.user.email) {
      sendMail({ to: booking.user.email, ...templates.bookingStatus(booking, siteUrl(req)) });
    }
    res.json(booking);
  })
);

module.exports = router;
