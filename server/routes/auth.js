const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { protect, JWT_SECRET } = require('../middleware/auth');
const { isNonEmptyString } = require('../utils/validate');
const { sendMail, templates, siteUrl } = require('../utils/mailer');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role });

const validPassword = (p) => typeof p === 'string' && p.length >= 6 && p.length <= 128;
const PASSWORD_RULE = 'Password must be 6-128 characters';

// POST /api/auth/register  (customers only; admins are created by the seed script)
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (![name, email, password].every(isNonEmptyString)) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (phone !== undefined && typeof phone !== 'string') {
      return res.status(400).json({ message: 'Please enter a valid mobile number' });
    }
    if (!validPassword(password)) return res.status(400).json({ message: PASSWORD_RULE });
    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });

    const user = await User.create({ name, email, phone, password, role: 'customer' });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  })
);

// POST /api/auth/login  (the account's role decides where the client sends the user)
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (role && role !== user.role) {
      return res.status(403).json({ message: `This account is not registered as ${role}` });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

// PUT /api/auth/me -> update own name / phone
router.put(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    if (name !== undefined) {
      if (!isNonEmptyString(name)) return res.status(400).json({ message: 'Name is required' });
      req.user.name = name;
    }
    if (phone !== undefined) {
      if (typeof phone !== 'string') return res.status(400).json({ message: 'Please enter a valid mobile number' });
      req.user.phone = phone.trim() || undefined;
    }
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  })
);

// PUT /api/auth/password -> change password (signs out other sessions, returns a fresh token)
router.put(
  '/password',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!isNonEmptyString(currentPassword)) return res.status(400).json({ message: 'Current password is required' });
    if (!validPassword(newPassword)) return res.status(400).json({ message: PASSWORD_RULE });
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated', token: signToken(user), user: publicUser(user) });
  })
);

// POST /api/auth/forgot-password -> emails a reset link. Same answer whether or not the email exists.
router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!isNonEmptyString(email)) return res.status(400).json({ message: 'Please enter your email' });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user) {
      const token = user.createResetToken();
      await user.save({ validateModifiedOnly: true });
      const link = `${siteUrl(req)}/reset-password/${token}`;
      sendMail({ to: user.email, ...templates.passwordReset(user, link) });
    }
    res.json({ message: 'If an account exists for this email, a reset link is on its way. Check your inbox.' });
  })
);

// POST /api/auth/reset-password/:token -> set a new password and sign in
router.post(
  '/reset-password/:token',
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!validPassword(password)) return res.status(400).json({ message: PASSWORD_RULE });
    const user = await User.findByResetToken(req.params.token);
    if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired. Please request a new one.' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

module.exports = router;
