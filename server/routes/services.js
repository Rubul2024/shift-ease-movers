const router = require('express').Router();
const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { pick } = require('../utils/validate');

const SERVICE_FIELDS = ['title', 'description', 'icon', 'startingPrice', 'isActive'];

// GET /api/services -> active services (admins get all with ?all=true)
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.user && req.user.role === 'admin';
    const filter = isAdmin && req.query.all === 'true' ? {} : { isActive: true };
    res.json(await Service.find(filter).sort({ createdAt: 1 }));
  })
);

router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    res.status(201).json(await Service.create(pick(req.body, SERVICE_FIELDS)));
  })
);

router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const service = await Service.findByIdAndUpdate(req.params.id, pick(req.body, SERVICE_FIELDS), { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  })
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  })
);

module.exports = router;
