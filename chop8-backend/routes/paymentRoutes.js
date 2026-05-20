const express = require('express');
const router  = express.Router();
const { processPayment, downloadReceipt, getPaymentsByUser } = require('../controllers/paymentController');

// POST /api/payment/process
router.post('/process', processPayment);

// GET  /api/payment/receipt/:bookingId
router.get('/receipt/:bookingId', downloadReceipt);

// GET  /api/payment/user/:userId
router.get('/user/:userId', getPaymentsByUser);

module.exports = router;
