const mongoose = require('mongoose');

// Inquiries / contact messages submitted from the website. Maintained by admin.
const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true },
    phone: { type: String, required: [true, 'Phone is required'], trim: true },
    city: { type: String, trim: true },
    subject: { type: String, default: 'General inquiry', trim: true },
    message: { type: String, required: [true, 'Message is required'], trim: true },
    status: { type: String, enum: ['New', 'Contacted', 'Converted', 'Closed'], default: 'New' },
    adminNotes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
