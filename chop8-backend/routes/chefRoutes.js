const express = require('express');
const router  = express.Router();
const {
  getAllChefs,
  bookChef,
  toggleAvailability,
  getBusySlots,
  getBookingsByUser,
  getBookingsByChef,
  cancelBooking,
} = require('../controllers/chefController');

// GET  /api/chefs
router.get('/chefs', getAllChefs);

// POST /api/book
router.post('/book', bookChef);

// PUT  /api/chefs/:chefId/toggle-availability
router.put('/chefs/:chefId/toggle-availability', toggleAvailability);

// GET  /api/bookings/chef/:chefId/busy?date=YYYY-MM-DD
router.get('/bookings/chef/:chefId/busy', getBusySlots);

// GET  /api/bookings/user/:userId
router.get('/bookings/user/:userId', getBookingsByUser);

// GET  /api/bookings/chef/:chefId
router.get('/bookings/chef/:chefId', getBookingsByChef);

// DELETE /api/bookings/:bookingId
router.delete('/bookings/:bookingId', cancelBooking);

module.exports = router;
