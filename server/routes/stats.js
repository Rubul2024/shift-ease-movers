const router = require('express').Router();
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const Quote = require('../models/Quote');
const Area = require('../models/Area');
const User = require('../models/User');
const Subscriber = require('../models/Subscriber');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/stats -> admin dashboard numbers
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const [bookings, activeBookings, newContacts, contacts, quotes, newQuotes, areas, customers, subscribers, revenueAgg, recent] =
      await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ status: { $nin: ['Delivered', 'Cancelled'] } }),
        Contact.countDocuments({ status: 'New' }),
        Contact.countDocuments(),
        Quote.countDocuments(),
        Quote.countDocuments({ status: 'New' }),
        Area.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'customer' }),
        Subscriber.countDocuments(),
        Booking.aggregate([
          { $match: { status: { $ne: 'Cancelled' } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Booking.find().populate('pickupArea dropArea', 'name city').sort({ createdAt: -1 }).limit(5),
      ]);
    res.json({
      bookings,
      activeBookings,
      newContacts,
      contacts,
      quotes,
      newQuotes,
      areas,
      customers,
      subscribers,
      revenue: revenueAgg[0] ? revenueAgg[0].total : 0,
      recent,
    });
  })
);

module.exports = router;
