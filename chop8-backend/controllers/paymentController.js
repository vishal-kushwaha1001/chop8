/**
 * Converted from: backendChop8.controller.PaymentController
 * @RequestMapping /api/payment
 */
const { v4: uuidv4 } = require('uuid');
const Booking        = require('../models/Booking');

const nvl = v => (v != null ? v : 0.0);

const formatDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const timestampStr = () => new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

const buildReceipt = (booking, paymentId, amount, label, paidAt, smsText, customerName, customerMobile, chefName) => ({
  success:        true,
  paymentId,
  paymentLabel:   label,
  amountPaid:     amount,
  tokenId:        booking.tokenId || '',
  bookingId:      booking._id,
  chefName,
  customerName,
  customerMobile,
  date:           booking.date    || '',
  timeIn:         booking.timeIn  || '',
  timeOut:        booking.timeOut || '',
  chefAmount:     nvl(booking.chefAmount),
  platformCharge: nvl(booking.platformCharge),
  gstAmount:      nvl(booking.gstAmount),
  totalAmount:    nvl(booking.totalAmount),
  advanceAmount:  nvl(booking.advanceAmount),
  finalAmount:    nvl(booking.finalAmount),
  paidAt,
  smsText,
  message:        `${label} payment of Rs.${amount} successful.`,
});

// ── POST /api/payment/process ──────────────────────────
const processPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentType = 'ADVANCE' } = req.body;

    const booking = await Booking.findById(bookingId).populate('user').populate('chef');
    if (!booking) return res.status(400).json({ error: `Booking not found: ${bookingId}` });

    if (booking.status === 'CANCELLED')
      return res.status(400).json({ error: 'Cannot pay for a cancelled booking.' });

    const paymentId      = `TXN-${timestampStr()}-${uuidv4().slice(0, 6).toUpperCase()}`;
    const paidAt         = formatDate();
    const customerName   = booking.user?.name   || 'Customer';
    const customerMobile = booking.user?.mobile || '';
    const chefName       = booking.chef?.name   || 'Chef';

    if (paymentType.toUpperCase() === 'ADVANCE') {
      if (booking.advancePaymentStatus === 'PAID')
        return res.status(400).json({ error: 'Advance payment already completed.' });

      // Generate token after advance payment
      const count = await Booking.countDocuments();
      const token = `TKN-${String(count + 1).padStart(5, '0')}`;

      booking.tokenId              = token;
      booking.status               = 'CONFIRMED';
      booking.advancePaymentStatus = 'PAID';
      booking.advancePaymentId     = paymentId;
      booking.amountPaid           = amount;
      booking.paymentStatus        = 'ADVANCE_PAID';
      booking.paymentId            = paymentId;
      await booking.save();

      const smsText = `Dear ${customerName}, booking CONFIRMED! Token: ${token}. Advance Rs.${amount} paid for Chef ${chefName} on ${booking.date}. Pay final Rs.${booking.finalAmount} after service. Txn: ${paymentId} - Chop8`;

      const receipt = buildReceipt(booking, paymentId, amount, 'Advance (30%)', paidAt, smsText, customerName, customerMobile, chefName);
      receipt.tokenId = token; // ensure fresh token is returned
      return res.json(receipt);

    } else {
      // FINAL payment
      if (booking.advancePaymentStatus !== 'PAID')
        return res.status(400).json({ error: 'Complete the advance payment first.' });

      if (booking.finalPaymentStatus === 'PAID')
        return res.status(400).json({ error: 'Final payment already completed.' });

      booking.finalPaymentStatus = 'PAID';
      booking.finalPaymentId     = paymentId;
      booking.paymentStatus      = 'PAID';
      booking.amountPaid         = booking.totalAmount;
      booking.status             = 'EXPIRED';
      await booking.save();

      const smsText = `Dear ${customerName}, final Rs.${amount} paid for ${booking.tokenId} with Chef ${chefName} on ${booking.date}. Total Rs.${booking.totalAmount}. Txn: ${paymentId} - Chop8`;

      return res.json(buildReceipt(booking, paymentId, amount, 'Final (70%)', paidAt, smsText, customerName, customerMobile, chefName));
    }
  } catch (err) {
    res.status(500).json({ error: `Payment failed: ${err.message}` });
  }
};

// ── GET /api/payment/receipt/:bookingId ────────────────
const downloadReceipt = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.bookingId).populate('user').populate('chef');
    if (!b) return res.status(400).json({ error: 'Booking not found' });

    const customerName = b.user?.name || 'Customer';
    const chefName     = b.chef?.name || 'Chef';

    const lines = [
      '======================================',
      '         CHOP8 PAYMENT RECEIPT        ',
      '======================================',
      '',
      `Token ID      : ${b.tokenId || '—'}`,
      `Customer      : ${customerName}`,
      `Chef          : ${chefName}`,
      `Date          : ${b.date}`,
      `Timings       : ${b.timeIn} – ${b.timeOut}`,
      `Payment Mode  : ${b.paymentMode}`,
      '',
      '--------------------------------------',
      'PRICE BREAKDOWN',
      '--------------------------------------',
      `Chef Charges  : Rs.${nvl(b.chefAmount).toFixed(2)}`,
      `Platform Fee  : Rs.${nvl(b.platformCharge).toFixed(2)}`,
      `GST (3%)      : Rs.${nvl(b.gstAmount).toFixed(2)}`,
      '--------------------------------------',
      `TOTAL AMOUNT  : Rs.${nvl(b.totalAmount).toFixed(2)}`,
      '--------------------------------------',
      `Advance (30%) : Rs.${nvl(b.advanceAmount).toFixed(2)}  [${b.advancePaymentStatus === 'PAID' ? 'PAID' : 'PENDING'}]`,
      ...(b.advancePaymentId ? [`Advance Txn   : ${b.advancePaymentId}`] : []),
      `Final   (70%) : Rs.${nvl(b.finalAmount).toFixed(2)}  [${b.finalPaymentStatus === 'PAID' ? 'PAID' : 'PENDING'}]`,
      ...(b.finalPaymentId ? [`Final Txn     : ${b.finalPaymentId}`] : []),
      '',
      '======================================',
      'Thank you for using Chop8!',
      '======================================',
    ];

    const filename = `Chop8_Receipt_${b.tokenId || req.params.bookingId}.txt`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(lines.join('\n'));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ── GET /api/payment/user/:userId ──────────────────────
const getPaymentsByUser = async (req, res) => {
  try {
    const paid = await Booking.find({
      user: req.params.userId,
      paymentStatus: { $in: ['PAID', 'ADVANCE_PAID'] },
    }).populate('chef').populate('user');
    res.json(paid);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { processPayment, downloadReceipt, getPaymentsByUser };
