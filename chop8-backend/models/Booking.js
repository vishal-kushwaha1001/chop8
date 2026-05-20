const mongoose = require('mongoose');

// Converted from: backendChop8.booking.Booking (@Entity @Table name="booking")
// Java @ManyToOne Chef/User → MongoDB ObjectId references
const bookingSchema = new mongoose.Schema({
  date:   { type: String },

  // PENDING   — ONLINE booking created, advance not yet paid
  // CONFIRMED — advance paid (ONLINE) OR COD booking
  // EXPIRED   — booking time passed or fully paid online
  // CANCELLED — cancelled by customer
  status: { type: String },

  tokenId:     { type: String },
  timeIn:      { type: String },
  timeOut:     { type: String },
  paymentMode: { type: String },   // "COD" | "ONLINE"

  // Price breakdown — stored at booking time
  chefAmount:      { type: Number },
  platformCharge:  { type: Number },
  gstAmount:       { type: Number },
  totalAmount:     { type: Number },
  advanceAmount:   { type: Number },   // 30% of totalAmount
  finalAmount:     { type: Number },   // 70% of totalAmount

  // Split payment tracking
  advancePaymentStatus: { type: String },   // null | "PAID" | "COD"
  advancePaymentId:     { type: String },
  finalPaymentStatus:   { type: String },   // null | "PAID" | "COD"
  finalPaymentId:       { type: String },

  // Cancellation penalty
  cancellationPenalty: { type: Number },
  cancellationNote:    { type: String },

  // Emergency booking
  isEmergency:        { type: Boolean, default: false },
  emergencySurcharge: { type: Number },

  // Legacy fields kept for Payments page compatibility
  amountPaid:    { type: Number },
  paymentStatus: { type: String },
  paymentId:     { type: String },

  // Relationships (Java @ManyToOne → MongoDB ObjectId refs)
  chef: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
