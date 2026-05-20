const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');

// GET /api/profile/:role/:id
router.get('/:role/:id', getProfile);

// PUT /api/profile/:role/:id
router.put('/:role/:id', updateProfile);

module.exports = router;
