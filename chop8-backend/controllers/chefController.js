/**
 * Converted from: backendChop8.controller.ChefController
 * @RequestMapping /api
 */
const Chef              = require('../models/Chef');
const Booking           = require('../models/Booking');
const availabilityStore = require('../services/availabilityStore');
const bookingService    = require('../services/bookingService');

// ── GET /api/chefs ─────────────────────────────────────
const getAllChefs = async (req, res) => {
  try {
    const chefs = await Chef.find().lean();
    // .lean() returns plain objects with _id only (no virtual `id`).
    // Add `id` as a string so the frontend can use chef.id consistently.
    chefs.forEach(c => {
      c.id        = String(c._id);
      c.available = availabilityStore.isAvailable(c.id);
    });
    res.json(chefs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/book ─────────────────────────────────────
const bookChef = async (req, res) => {
  try {
    const result = await bookingService.bookChef(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── PUT /api/chefs/:chefId/toggle-availability ─────────
const toggleAvailability = async (req, res) => {
  try {
    const { chefId } = req.params;
    const chef = await Chef.findById(chefId);
    if (!chef) return res.status(400).json({ error: 'Chef not found.' });

    const nowAvailable = availabilityStore.toggle(String(chefId));
    const message      = nowAvailable ? 'You are now available' : 'You are now unavailable';
    res.json({ available: nowAvailable, message });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── GET /api/bookings/chef/:chefId/busy ────────────────
const getBusySlots = async (req, res) => {
  try {
    const { chefId } = req.params;
    const { date }   = req.query;
    const slots      = await bookingService.getBusySlotsForDate(chefId, date);

    const bookedSlots = slots.map(b => ({ timeIn: b.timeIn, timeOut: b.timeOut }));
    res.json({ busy: slots.length > 0, count: slots.length, bookedSlots });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── GET /api/bookings/user/:userId ─────────────────────
const getBookingsByUser = async (req, res) => {
  try {
    const bookings = await bookingService.getBookingsByUser(req.params.userId);
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── GET /api/bookings/chef/:chefId ─────────────────────
const getBookingsByChef = async (req, res) => {
  try {
    const bookings = await bookingService.getBookingsByChef(req.params.chefId);
    res.json(bookings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── DELETE /api/bookings/:bookingId ────────────────────
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const exists = await Booking.exists({ _id: bookingId });
    if (!exists) return res.status(404).json({ error: `Booking not found: ${bookingId}` });

    const cancelled = await bookingService.cancelBooking(bookingId);
    res.json({
      message:             'Booking cancelled successfully',
      status:              cancelled.status,
      tokenId:             cancelled.tokenId             || '',
      cancellationPenalty: cancelled.cancellationPenalty ?? 0.0,
      cancellationNote:    cancelled.cancellationNote    || '',
    });
  } catch (err) {
    res.status(500).json({ error: `Could not cancel: ${err.message}` });
  }
};

module.exports = {
  getAllChefs,
  bookChef,
  toggleAvailability,
  getBusySlots,
  getBookingsByUser,
  getBookingsByChef,
  cancelBooking,
};