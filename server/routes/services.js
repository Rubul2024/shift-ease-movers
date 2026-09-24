const router = require('express').Router();
const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await Service.find({ isActive: true }).sort({ createdAt: 1 }));
  })
);

router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    res.status(201).json(await Service.create(req.body));
  })
);

router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  })
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  })
);

module.exports = router;
