const mongoose = require('mongoose');
const { EMAIL_RE, PHONE_RE } = require('../utils/validate');

// Inquiries / contact messages submitted from the website. Maintained by admin.
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true, match: [EMAIL_RE, 'Please enter a valid email'] },
    phone: { type: String, required: [true, 'Phone is required'], trim: true, match: [PHONE_RE, 'Please enter a valid mobile number'] },
    city: { type: String, trim: true, maxlength: 100 },
    subject: { type: String, default: 'General inquiry', trim: true, maxlength: 100 },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: [2000, 'Message is too long (max 2000 characters)'] },
    status: { type: String, enum: ['New', 'Contacted', 'Converted', 'Closed'], default: 'New' },
    adminNotes: { type: String, trim: true, default: '', maxlength: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
