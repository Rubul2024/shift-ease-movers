const router = require('express').Router();
const Quote = require('../models/Quote');
const Area = require('../models/Area');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { calculateQuote, distanceBetween, VEHICLES, HOUSE_TYPES } = require('../utils/pricing');

async function resolveAreas(fromArea, toArea) {
  const [from, to] = await Promise.all([Area.findById(fromArea), Area.findById(toArea)]);
  if (!from || !to) {
    const err = new Error('Please choose a valid pickup and drop area');
    err.status = 400;
    throw err;
  }
  if (!from.isActive || !to.isActive) {
    const err = new Error('Sorry, we are not serving one of the selected areas right now');
    err.status = 400;
    throw err;
  }
  return { from, to };
}

// GET /api/quotes/options -> price tables for the UI
router.get('/options', (req, res) => res.json({ vehicles: VEHICLES, houseTypes: HOUSE_TYPES }));

// POST /api/quotes/estimate -> instant price, nothing saved
router.post(
  '/estimate',
  asyncHandler(async (req, res) => {
    const { from, to } = await resolveAreas(req.body.fromArea, req.body.toArea);
    const distanceKm = req.body.distanceKm || distanceBetween(from, to);
    const breakdown = calculateQuote({ ...req.body, distanceKm });
    res.json({ distanceKm, breakdown });
  })
);

// POST /api/quotes -> save a quotation request (lead)
router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { from, to } = await resolveAreas(req.body.fromArea, req.body.toArea);
    const distanceKm = req.body.distanceKm || distanceBetween(from, to);
    const breakdown = calculateQuote({ ...req.body, distanceKm });
    const quote = await Quote.create({
      ...req.body,
      user: req.user ? req.user._id : undefined,
      distanceKm,
      breakdown,
      status: 'New',
    });
    res.status(201).json(await quote.populate('fromArea toArea', 'name city'));
  })
);

// GET /api/quotes/mine
router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    const quotes = await Quote.find({ $or: [{ user: req.user._id }, { email: req.user.email }] })
      .populate('fromArea toArea', 'name city')
      .sort({ createdAt: -1 });
    res.json(quotes);
  })
);

// ---------- Admin ----------
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    res.json(await Quote.find().populate('fromArea toArea', 'name city').sort({ createdAt: -1 }));
  })
);

router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate('fromArea toArea', 'name city');
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json(quote);
  })
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quote deleted' });
  })
);

module.exports = router;
