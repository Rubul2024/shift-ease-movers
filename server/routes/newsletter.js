const router = require('express').Router();
const Subscriber = require('../models/Subscriber');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');
const { isNonEmptyString } = require('../utils/validate');

// POST /api/newsletter -> public sign-up (re-subscribing is not an error)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!isNonEmptyString(email)) return res.status(400).json({ message: 'Please enter your email' });
    const normalized = email.trim().toLowerCase();
    const existing = await Subscriber.findOne({ email: normalized });
    if (!existing) await Subscriber.create({ email: normalized });
    res.status(existing ? 200 : 201).json({ message: "You're subscribed. Thank you!" });
  })
);

// ---------- Admin ----------
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    res.json(await Subscriber.find().sort({ createdAt: -1 }));
  })
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const sub = await Subscriber.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscriber not found' });
    res.json({ message: 'Subscriber removed' });
  })
);

module.exports = router;
