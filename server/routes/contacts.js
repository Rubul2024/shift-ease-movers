const router = require('express').Router();
const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/contacts  -> public inquiry form
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, phone, city, subject, message } = req.body;
    const contact = await Contact.create({ name, email, phone, city, subject, message });
    res.status(201).json({ message: 'Thanks! Our team will call you within 30 minutes.', contact });
  })
);

// ---------- Admin: view & maintain all contact details ----------
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { city: rx }, { message: rx }];
    }
    res.json(await Contact.find(filter).sort({ createdAt: -1 }));
  })
);

router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const allowed = ['name', 'email', 'phone', 'city', 'subject', 'message', 'status', 'adminNotes'];
    const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const contact = await Contact.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  })
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  })
);

module.exports = router;
