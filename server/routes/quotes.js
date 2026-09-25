const router = require('express').Router();
const Quote = require('../models/Quote');
const Area = require('../models/Area');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { calculateQuote, distanceBetween, VEHICLES, HOUSE_TYPES } = require('../utils/pricing');
const { pick, httpError, escapeRegex, parseMoveDate } = require('../utils/validate');
const { sendMail, templates, siteUrl } = require('../utils/mailer');

const MOVE_FIELDS = ['vehicleType', 'houseType', 'pickupFloor', 'dropFloor', 'liftAvailable', 'premiumPacking', 'insurance'];
const QUOTE_FIELDS = [...MOVE_FIELDS, 'name', 'email', 'phone', 'fromArea', 'toArea', 'movingDate', 'notes'];

async function resolveAreas(fromArea, toArea) {
  if (!fromArea || !toArea) throw httpError(400, 'Please choose a valid pickup and drop area');
  const [from, to] = await Promise.all([Area.findById(fromArea), Area.findById(toArea)]);
  if (!from || !to) throw httpError(400, 'Please choose a valid pickup and drop area');
  if (!from.isActive || !to.isActive) {
    throw httpError(400, 'Sorry, we are not serving one of the selected areas right now');
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
    const distanceKm = distanceBetween(from, to);
    const breakdown = calculateQuote({ ...pick(req.body, MOVE_FIELDS), distanceKm });
    res.json({ distanceKm, breakdown });
  })
);

// POST /api/quotes -> save a quotation request (lead)
router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { from, to } = await resolveAreas(req.body.fromArea, req.body.toArea);
    const distanceKm = distanceBetween(from, to);
    const fields = pick(req.body, QUOTE_FIELDS);
    fields.movingDate = parseMoveDate(fields.movingDate);
    const breakdown = calculateQuote({ ...fields, distanceKm });
    const quote = await Quote.create({
      ...fields,
      user: req.user ? req.user._id : undefined,
      distanceKm,
      breakdown,
      status: 'New',
    });
    await quote.populate('fromArea toArea', 'name city');
    sendMail({ to: quote.email, ...templates.quoteReady(quote, siteUrl(req)) });
    res.status(201).json(quote);
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
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    res.json(await Quote.find(filter).populate('fromArea toArea', 'name city').sort({ createdAt: -1 }).limit(500));
  })
);

router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      pick(req.body, ['status', 'notes']),
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
    const quote = await Quote.findByIdAndDelete(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json({ message: 'Quote deleted' });
  })
);

module.exports = router;
