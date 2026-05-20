/**
 * Converted from: backendChop8.service.BookingService
 * All business logic for bookings, cancellations, expiry.
 */
const Booking           = require('../models/Booking');
const Chef              = require('../models/Chef');
const User              = require('../models/User');
const availabilityStore = require('./availabilityStore');

const PLATFORM_CHARGE       = 49.0;
const GST_RATE              = 0.03;
const ADVANCE_PERCENT       = 0.30;
const CANCEL_CUTOFF_HRS     = 3;
const EMERGENCY_THRESHOLD_HRS = 5;
const EMERGENCY_MULTIPLIER    = 1.5;

// ── Book a chef ────────────────────────────────────────
async function bookChef(bookingData) {
  const { user: userField, chef: chefField, date, timeIn, timeOut, paymentMode } = bookingData;

  // Frontend sends { user: { id: "..." }, chef: { id: "..." } }
  // Extract the actual ObjectId string from either format
  const userId = (userField && typeof userField === 'object' && userField.id)
    ? userField.id
    : userField;
  const chefId = (chefField && typeof chefField === 'object' && chefField.id)
    ? chefField.id
    : chefField;

  const userExists = await User.exists({ _id: userId });
  if (!userExists) throw new Error('Only customers can book chefs.');

  const chef = await Chef.findById(chefId);
  if (!chef) throw new Error('Chef not found.');

  if (!availabilityStore.isAvailable(String(chefId)))
    throw new Error('This chef is currently not available for booking.');

  // ── Time-overlap check ──────────────────────────────
  if (timeIn && timeOut) {
    const dateBookings = await getConfirmedBookingsForDate(chefId, date);
    for (const existing of dateBookings) {
      const exIn  = existing.timeIn;
      const exOut = existing.timeOut;
      if (exIn && exOut) {
        const overlaps = timeIn < exOut && timeOut > exIn;
        if (overlaps) {
          throw new Error(
            `${chef.name} is already booked from ${exIn} to ${exOut} on ${date}. Please choose a different time slot.`
          );
        }
      }
    }
  }

  // Check for duplicate confirmed booking (same chef/user/date)
  const duplicate = await Booking.findOne({ chef: chefId, user: userId, date, status: 'CONFIRMED' });
  if (duplicate)
    throw new Error(`You already have a booking with ${chef.name} on ${date}. Please cancel it first.`);

  if (!timeIn  || !timeIn.trim())  throw new Error('Please provide a check-in time.');
  if (!timeOut || !timeOut.trim()) throw new Error('Please provide a check-out time.');
  if (timeOut <= timeIn)           throw new Error('Check-out time must be after check-in time.');

  if (!paymentMode || !['COD', 'ONLINE'].includes(paymentMode))
    throw new Error('Please select a payment method (COD or ONLINE).');

  // ── Emergency booking detection ─────────────────────
  let emergency          = false;
  let emergencySurcharge = 0.0;
  try {
    const today        = new Date(); today.setHours(0,0,0,0);
    const bookingDate  = new Date(date); bookingDate.setHours(0,0,0,0);
    const now          = new Date();
    const [h, m]       = timeIn.split(':').map(Number);
    const bookingStart = new Date(date);
    bookingStart.setHours(h, m, 0, 0);
    const hoursUntil   = (bookingStart - now) / (1000 * 60 * 60);

    if (bookingDate.getTime() === today.getTime() && hoursUntil >= 0 && hoursUntil <= EMERGENCY_THRESHOLD_HRS) {
      emergency = true;
    }
  } catch (_) {}

  // ── Price calculation ───────────────────────────────
  const chefAmt         = chef.pricePerDay || 0.0;
  const effectiveChefAmt = emergency
    ? Math.round(chefAmt * EMERGENCY_MULTIPLIER * 100) / 100
    : chefAmt;

  if (emergency) {
    emergencySurcharge = Math.round((effectiveChefAmt - chefAmt) * 100) / 100;
  }

  const platform = PLATFORM_CHARGE;
  const gst      = Math.round((effectiveChefAmt + platform) * GST_RATE * 100) / 100;
  const total    = Math.round((effectiveChefAmt + platform + gst) * 100) / 100;
  const advance  = Math.round(total * ADVANCE_PERCENT * 100) / 100;
  const finalAmt = Math.round((total - advance) * 100) / 100;

  // ── Build booking document ─────────────────────────
  // Use resolved userId/chefId (plain strings) — NOT bookingData.user/chef
  // which may be { id: "..." } objects sent by the frontend and would
  // fail the Mongoose ObjectId cast.
  const newBooking = new Booking({
    date, timeIn, timeOut, paymentMode,
    user: userId,
    chef: chefId,
    chefAmount:      effectiveChefAmt,
    platformCharge:  platform,
    gstAmount:       gst,
    totalAmount:     total,
    advanceAmount:   advance,
    finalAmount:     finalAmt,
    isEmergency:     emergency,
    emergencySurcharge: emergency ? emergencySurcharge : undefined,
  });

  if (paymentMode === 'COD') {
    const maxDoc = await Booking.findOne({}, { _id: 1 }).sort({ _id: -1 });
    // Use a sequential counter stored in DB for token uniqueness
    const count  = await Booking.countDocuments() + 1;
    newBooking.tokenId              = `TKN-${String(count).padStart(5, '0')}`;
    newBooking.status               = 'CONFIRMED';
    newBooking.advancePaymentStatus = 'COD';
    newBooking.finalPaymentStatus   = 'COD';
    newBooking.paymentStatus        = 'COD';
  } else {
    newBooking.tokenId = null;
    newBooking.status  = 'PENDING';
  }

  return await newBooking.save();
}

// ── Cancel booking ─────────────────────────────────────
async function cancelBooking(bookingId) {
  const booking = await Booking.findById(bookingId).populate('user').populate('chef');
  if (!booking) throw new Error(`Booking not found: ${bookingId}`);

  let lateCancellation = false;
  if (booking.date && booking.timeIn) {
    try {
      const [h, m]       = booking.timeIn.split(':').map(Number);
      const bookingStart = new Date(booking.date);
      bookingStart.setHours(h, m, 0, 0);
      const cutoff       = new Date(bookingStart.getTime() - CANCEL_CUTOFF_HRS * 60 * 60 * 1000);
      lateCancellation   = new Date() > cutoff;
    } catch (_) {}
  }

  booking.status = 'CANCELLED';

  if (lateCancellation) {
    const advancePaid = booking.advancePaymentStatus === 'PAID';
    if (advancePaid) {
      const penalty = booking.advanceAmount || 0;
      booking.cancellationPenalty = penalty;
      booking.cancellationNote    = `Late cancellation within ${CANCEL_CUTOFF_HRS} hours. Advance of ₹${penalty} is non-refundable.`;
    } else {
      booking.cancellationPenalty = 0;
      booking.cancellationNote    = `Cancelled within ${CANCEL_CUTOFF_HRS} hours. No advance paid so no deduction.`;
    }
  }

  return await booking.save();
}

// ── Auto-expire bookings ───────────────────────────────
async function releaseExpiredBookings() {
  const now      = new Date();
  const bookings = await Booking.find({ status: 'CONFIRMED' });

  for (const b of bookings) {
    if (!b.date) continue;
    try {
      let expireAt;
      if (b.timeOut && b.timeOut.trim()) {
        const [h, m] = b.timeOut.split(':').map(Number);
        expireAt     = new Date(b.date);
        expireAt.setHours(h, m, 0, 0);
      } else {
        expireAt = new Date(b.date);
        expireAt.setDate(expireAt.getDate() + 1);
      }

      if (now <= expireAt) continue;

      const isCOD     = b.paymentMode === 'COD';
      const finalPaid = b.finalPaymentStatus === 'PAID' || b.paymentStatus === 'PAID';

      if (isCOD || finalPaid) {
        b.status = 'EXPIRED';
        await b.save();
      } else {
        const hoursAfterExpiry = (now - expireAt) / (1000 * 60 * 60);
        if (hoursAfterExpiry >= 24) {
          b.status = 'EXPIRED';
          await b.save();
        }
      }
    } catch (_) {}
  }
}

// ── Helpers ────────────────────────────────────────────
async function getConfirmedBookingsForDate(chefId, date) {
  return Booking.find({ chef: chefId, date, status: 'CONFIRMED' });
}

async function getBusySlotsForDate(chefId, date) {
  await releaseExpiredBookings();
  return getConfirmedBookingsForDate(chefId, date);
}

async function getBookingsByUser(userId) {
  await releaseExpiredBookings();
  return Booking.find({ user: userId }).populate('chef').populate('user');
}

async function getBookingsByChef(chefId) {
  await releaseExpiredBookings();
  return Booking.find({ chef: chefId }).populate('chef').populate('user');
}

module.exports = {
  bookChef,
  cancelBooking,
  releaseExpiredBookings,
  getBusySlotsForDate,
  getBookingsByUser,
  getBookingsByChef,
};