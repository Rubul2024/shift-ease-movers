require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const isProd = process.env.NODE_ENV === 'production';

// Fail fast on insecure production config instead of silently using dev defaults.
const jwtSecret = process.env.JWT_SECRET || '';
if (isProd && (jwtSecret.length < 32 || jwtSecret.startsWith('change_this'))) {
  console.error('JWT_SECRET must be set to a random string of at least 32 characters in production.');
  process.exit(1);
}

const app = express();

app.disable('x-powered-by');
// Query values are always plain strings (blocks ?status[$ne]=x style operator injection).
app.set('query parser', 'simple');
// Needed behind Render/Railway/Nginx so rate limiting sees the real client IP.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'data:'],
      },
    },
  })
);
app.use(compression());

// CLIENT_URL may be a comma-separated list. Unset in production => same-origin only.
const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : !isProd }));
app.use(express.json({ limit: '100kb' }));

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: 'draft-7', legacyHeaders: false }));
const strictLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in a few minutes' },
});
app.use(['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'], strictLimit);
// Public lead forms: limit writes only, so browsing stays unaffected.
const formLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many submissions, please try again in a few minutes' },
});
app.post(['/api/contacts', '/api/quotes', '/api/newsletter'], formLimit);

app.get('/api/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded', db: dbUp, time: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/areas', require('./routes/areas'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/services', require('./routes/services'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/users', require('./routes/users'));

app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Serve the React production build when it exists (single-server deployment).
const clientBuild = path.join(__dirname, '..', 'client', 'build');
const indexHtml = path.join(clientBuild, 'index.html');
if (fs.existsSync(indexHtml)) {
  // Hashed bundles are immutable; index.html must always be revalidated so deploys show up.
  app.use('/static', express.static(path.join(clientBuild, 'static'), { immutable: true, maxAge: '1y' }));
  app.use(express.static(clientBuild, { index: false, maxAge: '1h' }));
  app.get('*', (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(indexHtml);
  });
} else if (isProd) {
  console.warn('client/build not found: run `npm run build` in client/ to serve the website from this server.');
}

// Central error handler: turns Mongoose errors into friendly JSON.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request body too large' });
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID' });
  if (err.code === 11000) return res.status(409).json({ message: 'This record already exists' });
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 && isProd ? 'Something went wrong' : err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  const server = app.listen(PORT, () => console.log(`ShiftEase API running on http://localhost:${PORT}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in server/.env.`);
    else console.error(err);
    process.exit(1);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(() => mongoose.connection.close(false).then(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});

process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
