const router = require('express').Router();
const Contact = require('../models/Contact');
const asyncHandler = require('../utils/asyncHandler');
const { protect, adminOnly } = require('../middleware/auth');
const { pick, escapeRegex } = require('../utils/validate');
const { sendMail, templates, siteUrl } = require('../utils/mailer');

// POST /api/contacts  -> public inquiry form
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const contact = await Contact.create(pick(req.body, ['name', 'email', 'phone', 'city', 'subject', 'message']));
    if (process.env.ADMIN_NOTIFY_EMAIL) {
      sendMail({ to: process.env.ADMIN_NOTIFY_EMAIL, replyTo: contact.email, ...templates.newInquiry(contact, siteUrl(req)) });
    }
    sendMail({ to: contact.email, ...templates.inquiryReceived(contact) });
    res.status(201).json({ message: 'Thanks! Our team will call you within 30 minutes.', id: contact._id });
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
    if (status) filter.status = String(status);
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
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
    const update = pick(req.body, ['name', 'email', 'phone', 'city', 'subject', 'message', 'status', 'adminNotes']);
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
