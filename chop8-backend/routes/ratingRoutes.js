const express = require('express');
const router  = express.Router();
const {
  submitRating,
  getRatingsForRatee,
  checkRated,
  checkCustomerRated,
} = require('../controllers/ratingController');

// POST /api/ratings
router.post('/', submitRating);

// GET  /api/ratings/ratee/:rateeId
router.get('/ratee/:rateeId', getRatingsForRatee);

// GET  /api/ratings/booking/:bookingId/rater/:raterId?role=raterRole
router.get('/booking/:bookingId/rater/:raterId', checkRated);

// GET  /api/ratings/booking/:bookingId/customer-rated
router.get('/booking/:bookingId/customer-rated', checkCustomerRated);

module.exports = router;
