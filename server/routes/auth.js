const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { protect, JWT_SECRET } = require('../middleware/auth');
const { isNonEmptyString } = require('../utils/validate');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role });

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
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ message: 'Password must be 6-128 characters' });
    }
    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });

    const user = await User.create({ name, email, phone, password, role: 'customer' });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  })
);

// POST /api/auth/login
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

module.exports = router;
