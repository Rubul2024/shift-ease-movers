const router = require('express').Router();
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');
const { escapeRegex } = require('../utils/validate');

// GET /api/users?q= -> admin: customers with their booking count and spend
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const match = { role: 'customer' };
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(req.query.q.trim()), 'i');
      match.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    const users = await User.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $limit: 500 },
      { $lookup: { from: 'bookings', localField: '_id', foreignField: 'user', as: 'bookings' } },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          createdAt: 1,
          bookings: { $size: '$bookings' },
          spend: {
            $sum: {
              $map: {
                input: { $filter: { input: '$bookings', cond: { $ne: ['$$this.status', 'Cancelled'] } } },
                in: '$$this.amount',
              },
            },
          },
          lastBooking: { $max: '$bookings.createdAt' },
        },
      },
    ]);
    res.json(users);
  })
);

module.exports = router;
