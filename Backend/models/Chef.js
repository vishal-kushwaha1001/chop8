const mongoose = require('mongoose');

// Converted from: backendChop8.chef.Chef (@Entity @Table name="chef")
// Note: `available` was @Transient in Java (not persisted).
// In Node.js it is also excluded from DB — managed by ChefAvailabilityStore (in-memory Map).
const chefSchema = new mongoose.Schema({
  name:           { type: String },
  email:          { type: String, unique: true, required: true },
  password:       { type: String, required: true },
  mobile:         { type: String },
  address:        { type: String },
  role:           { type: String, default: 'chef' },
  pricePerDay:    { type: Number, default: 0.0 },
  specialisation: { type: String },
  avgRating:      { type: Number, default: 0.0 },
  ratingCount:    { type: Number, default: 0 },
  photo:          { type: String },
}, { timestamps: true, toJSON: { virtuals: true } });

module.exports = mongoose.model('Chef', chefSchema);