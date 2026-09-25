const router = require('express').Router();
const Area = require('../models/Area');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { pick, escapeRegex } = require('../utils/validate');
const { slotAvailability } = require('../utils/availability');

const AREA_FIELDS = ['name', 'city', 'state', 'pincodes', 'lat', 'lng', 'vehicleTypes', 'availableCabs', 'isActive', 'notes'];

// GET /api/areas  -> public list of serviceable areas (admins get all with ?all=true)
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const filter = isAdmin && req.query.all === 'true' ? {} : { isActive: true };
    if (req.query.city) filter.city = new RegExp(`^${escapeRegex(req.query.city)}$`, 'i');
    const areas = await Area.find(filter).sort({ city: 1, name: 1 });
    res.json(areas);
  })
);

// GET /api/areas/check?pincode=560034  -> is a pincode serviceable?
router.get(
  '/check',
  asyncHandler(async (req, res) => {
    const pincode = String(req.query.pincode || '').trim();
    if (!pincode) return res.status(400).json({ message: 'Pincode is required' });
    const area = await Area.findOne({ pincodes: pincode, isActive: true });
    res.json({ serviceable: !!area, area });
  })
);

// GET /api/areas/:id/availability?date=YYYY-MM-DD -> live cabs left per time slot
router.get(
  '/:id/availability',
  asyncHandler(async (req, res) => {
    const day = String(req.query.date || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(new Date(day).getTime())) {
      return res.status(400).json({ message: 'Please choose a valid date' });
    }
    const area = await Area.findById(req.params.id);
    if (!area) return res.status(404).json({ message: 'Area not found' });
    res.set('Cache-Control', 'no-store');
    res.json({ area: area._id, date: day, cabsPerSlot: area.availableCabs, slots: await slotAvailability(area, day) });
  })
);

// ---------- Admin: define & maintain serviceable areas ----------
router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const area = await Area.create(pick(req.body, AREA_FIELDS));
    res.status(201).json(area);
  })
);

router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const area = await Area.findByIdAndUpdate(req.params.id, pick(req.body, AREA_FIELDS), { new: true, runValidators: true });
    if (!area) return res.status(404).json({ message: 'Area not found' });
    res.json(area);
  })
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const area = await Area.findByIdAndDelete(req.params.id);
    if (!area) return res.status(404).json({ message: 'Area not found' });
    res.json({ message: 'Area removed' });
  })
);

module.exports = router;
