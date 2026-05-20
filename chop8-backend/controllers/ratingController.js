/**
 * Converted from: backendChop8.controller.RatingController
 * @RequestMapping /api/ratings
 */
const Rating  = require('../models/Rating');
const Chef    = require('../models/Chef');
const User    = require('../models/User');
const Booking = require('../models/Booking');

// ── POST /api/ratings ──────────────────────────────────
const submitRating = async (req, res) => {
  try {
    const {
      bookingId, raterId, rateeId,
      stars, comment = '', raterName = '',
      raterRole = '', rateeRole = '',
    } = req.body;

    const starsInt = parseInt(stars);
    if (starsInt < 1 || starsInt > 5)
      return res.status(400).json({ error: 'Stars must be 1–5.' });

    // ── Duplicate check (role-aware, same fix as Java version) ──
    const existing = await Rating.findOne({ bookingId: String(bookingId), raterId: String(raterId), raterRole });
    if (existing)
      return res.status(400).json({ error: 'You have already rated this booking.' });

    const createdAt = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }) + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    await Rating.create({
      bookingId:  String(bookingId),
      raterId:    String(raterId),
      raterName,
      raterRole,
      rateeId:    String(rateeId),
      rateeRole,
      stars:      starsInt,
      comment:    comment.trim() || null,
      createdAt,
    });

    // ── Update avgRating using role-aware aggregation ───
    const agg = await Rating.aggregate([
      { $match: { rateeId: String(rateeId), rateeRole } },
      { $group: { _id: null, avg: { $avg: '$stars' }, count: { $sum: 1 } } },
    ]);

    const avg     = agg[0]?.avg   || 0;
    const count   = agg[0]?.count || 0;
    const rounded = Math.round(avg * 10) / 10;

    if (rateeRole.toLowerCase() === 'chef') {
      await Chef.findByIdAndUpdate(rateeId, { avgRating: rounded, ratingCount: count });
    } else {
      await User.findByIdAndUpdate(rateeId, { avgRating: rounded, ratingCount: count });
    }

    res.json({ message: 'Rating submitted successfully', stars: starsInt, avgRating: rounded, ratingCount: count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── GET /api/ratings/ratee/:rateeId ───────────────────
const getRatingsForRatee = async (req, res) => {
  try {
    const { rateeId } = req.params;
    const ratings = await Rating.find({ rateeId: String(rateeId) });
    const agg     = await Rating.aggregate([
      { $match: { rateeId: String(rateeId) } },
      { $group: { _id: null, avg: { $avg: '$stars' }, count: { $sum: 1 } } },
    ]);
    const avg   = agg[0]?.avg   || 0;
    const count = agg[0]?.count || 0;
    res.json({ ratings, average: Math.round(avg * 10) / 10, count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── GET /api/ratings/booking/:bookingId/rater/:raterId ─
// ?role=raterRole (optional)
const checkRated = async (req, res) => {
  try {
    const { bookingId, raterId } = req.params;
    const { role } = req.query;

    let alreadyRated;
    if (role && role.trim()) {
      alreadyRated = !!(await Rating.findOne({
        bookingId: String(bookingId),
        raterId:   String(raterId),
        raterRole: role,
      }));
    } else {
      alreadyRated = !!(await Rating.findOne({
        bookingId: String(bookingId),
        raterId:   String(raterId),
      }));
    }

    res.json({ alreadyRated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── GET /api/ratings/booking/:bookingId/customer-rated ─
const checkCustomerRated = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const ratings      = await Rating.find({ bookingId: String(bookingId) });
    const customerRated = ratings.some(r => r.raterRole?.toLowerCase() === 'customer');

    const result = { rated: customerRated };

    const booking = await Booking.findById(bookingId).populate('user');
    if (booking?.user) {
      result.customerId   = booking.user._id;
      result.customerName = booking.user.name || 'Customer';
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { submitRating, getRatingsForRatee, checkRated, checkCustomerRated };
