const mongoose = require('mongoose');
const { EMAIL_RE } = require('../utils/validate');

// Newsletter sign-ups from the website footer.
const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_RE, 'Please enter a valid email'],
    },
    source: { type: String, default: 'footer', trim: true, maxlength: 50 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscriber', subscriberSchema);
