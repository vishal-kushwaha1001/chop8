const mongoose = require('mongoose');

// Converted from: backendChop8.User.User (@Entity @Table name="user")
const userSchema = new mongoose.Schema({
  name:        { type: String },
  email:       { type: String, unique: true, required: true },
  password:    { type: String, required: true },
  mobile:      { type: String },
  address:     { type: String },
  role:        { type: String, default: 'customer' },
  avgRating:   { type: Number, default: 0.0 },
  ratingCount: { type: Number, default: 0 },
  photo:       { type: String },  // stored as base64 / URL (was LONGTEXT in MySQL)
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('User', userSchema);