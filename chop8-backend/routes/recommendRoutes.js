const express = require('express');
const router  = express.Router();
const { getRecommendedChefs, debugRecommend } = require('../controllers/recommendController');

// GET /api/recommend/chefs
router.get('/chefs', getRecommendedChefs);

// GET /api/recommend/debug
router.get('/debug', debugRecommend);

module.exports = router;
