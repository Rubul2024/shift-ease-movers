const jwt = require('jsonwebtoken');
const User = require('../models/User');

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

async function loadUser(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
  return User.findById(decoded.id);
}

/** Requires a valid JWT. */
async function protect(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: 'Please log in to continue' });
  try {
    const user = await loadUser(token);
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
}

/** Attaches req.user when a valid token is present, but never blocks. */
async function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = await loadUser(token);
    } catch (err) {
      /* ignore invalid token for public endpoints */
    }
  }
  next();
}

function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access only' });
}

module.exports = { protect, optionalAuth, adminOnly };
