const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  url:         { type: String, required: true },
  publicId:    { type: String },
  type:        { type: String, enum: ['photo', 'video'], default: 'photo' },
  category:    { type: String, default: 'Events' },
  date:        { type: Date, default: Date.now },
  photographer:{ type: String, default: '@ballandboujee' },
  caption:     { type: String },
  featured:    { type: Boolean, default: false },
  status:      { type: String, enum: ['published', 'draft'], default: 'published' },
  tags:        [String],
}, { timestamps: true });

archiveSchema.index({ status: 1, date: -1 });

module.exports = mongoose.model('Archive', archiveSchema);
