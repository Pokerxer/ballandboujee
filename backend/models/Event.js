const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  date: { type: Date, required: true },
  endDate: { type: Date },
  time: { type: String },
  location: { type: String },
  address: { type: String },
  isOnline: { type: Boolean, default: false },
  onlineLink: { type: String },
  image: { url: String, publicId: String },
  category: {
    type: String,
    enum: ['fashion-show', 'sale', 'launch', 'workshop', 'pop-up', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
  },
  isFeatured: { type: Boolean, default: false },
  capacity: { type: Number },
  registrations: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  tags: [String],
}, { timestamps: true });

eventSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);
