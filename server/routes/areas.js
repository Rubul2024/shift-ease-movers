const router = require('express').Router();
const Area = require('../models/Area');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// GET /api/areas  -> public list of serviceable areas (admins get all with ?all=true)
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const filter = isAdmin && req.query.all === 'true' ? {} : { isActive: true };
    if (req.query.city) filter.city = new RegExp(`^${req.query.city}$`, 'i');
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

// ---------- Admin: define & maintain serviceable areas ----------
router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const area = await Area.create(req.body);
    res.status(201).json(area);
  })
);

router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const area = await Area.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
