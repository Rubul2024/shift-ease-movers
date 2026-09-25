const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { EMAIL_RE, PHONE_RE } = require('../utils/validate');

const RESET_TTL_MS = 60 * 60 * 1000; // password reset links are valid for 1 hour

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_RE, 'Please enter a valid email'],
    },
    phone: { type: String, trim: true, match: [PHONE_RE, 'Please enter a valid mobile number'] },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    passwordChangedAt: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false, index: true },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
  // Tokens issued before this moment stop working (see middleware/auth.js).
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

/** Creates a one-time reset token; only its hash is stored. Returns the plain token for the email link. */
userSchema.methods.createResetToken = function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = hashToken(token);
  this.resetPasswordExpires = new Date(Date.now() + RESET_TTL_MS);
  return token;
};

userSchema.statics.findByResetToken = function findByResetToken(token) {
  return this.findOne({ resetPasswordToken: hashToken(String(token)), resetPasswordExpires: { $gt: new Date() } }).select(
    '+resetPasswordToken +resetPasswordExpires'
  );
};

module.exports = mongoose.model('User', userSchema);
