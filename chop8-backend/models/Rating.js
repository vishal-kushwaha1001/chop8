const mongoose = require('mongoose');

// Converted from: backendChop8.rating.Rating (@Entity @Table name="rating")
// Note: raterId/rateeId/bookingId are stored as strings (MongoDB _id values)
// matching the original Java Long ids — keep consistent with frontend usage.
const ratingSchema = new mongoose.Schema({
  raterId:   { type: String },    // stored as string to match MongoDB ObjectId
  raterName: { type: String },
  raterRole: { type: String },    // "customer" or "chef"
  rateeId:   { type: String },
  rateeRole: { type: String },    // "chef" or "customer"
  stars:     { type: Number, min: 1, max: 5 },
  comment:   { type: String },
  bookingId: { type: String },
  createdAt: { type: String },
});

module.exports = mongoose.model('Rating', ratingSchema);
