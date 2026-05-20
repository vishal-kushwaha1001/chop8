/**
 * Converted from: backendChop8.controller.RecommendController
 * @RequestMapping /api/recommend
 *
 * Java RestTemplate.postForEntity → axios.post
 * @Value python.recommend.url    → process.env.PYTHON_RECOMMEND_URL
 */
const axios  = require('axios');
const Chef   = require('../models/Chef');
const Rating = require('../models/Rating');

const PYTHON_URL = process.env.PYTHON_RECOMMEND_URL || 'http://localhost:5000/recommend';

const label = score => {
  if (score >= 4.5) return 'Highly Recommended';
  if (score >= 3.5) return 'Recommended';
  if (score >= 2.5) return 'Good';
  if (score >= 1.0) return 'Average';
  return 'Unrated';
};

const safeRatings = async chefId => {
  try {
    return await Rating.find({ rateeId: String(chefId), rateeRole: 'chef' });
  } catch (_) { return []; }
};

const buildPayload = async chefs => {
  const payload = [];
  for (const chef of chefs) {
    const ratings = await safeRatings(chef._id);
    const reviews = ratings.map(r => ({ stars: r.stars, comment: r.comment || '' }));
    payload.push({
      id:             chef._id,
      name:           chef.name           || '',
      specialisation: chef.specialisation || '',
      pricePerDay:    chef.pricePerDay    || 0,
      avgRating:      chef.avgRating      || 0,
      ratingCount:    chef.ratingCount    || 0,
      reviews,
    });
  }
  return payload;
};

const buildFallbackJson = chefs => {
  const ranked = [...chefs]
    .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
    .map(chef => {
      const score = chef.avgRating || 0;
      return {
        id:             chef._id,
        name:           chef.name           || '',
        specialisation: chef.specialisation || '',
        pricePerDay:    chef.pricePerDay    || 0,
        avgRating:      score,
        ratingCount:    chef.ratingCount    || 0,
        recommendScore: score,
        recommendLabel: label(score),
        sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 },
      };
    });
  return { ranked, fallback: true, message: 'Python ML offline — showing star-rating order' };
};

// ── GET /api/recommend/chefs ───────────────────────────
const getRecommendedChefs = async (req, res) => {
  let chefs;
  try {
    chefs = await Chef.find().lean();
  } catch (err) {
    return res.json({ ranked: [], fallback: true, message: `DB error: ${err.message}` });
  }

  if (!chefs.length)
    return res.json({ ranked: [], fallback: false, message: 'No chefs in database' });

  const payload = await buildPayload(chefs);

  try {
    const pythonRes = await axios.post(PYTHON_URL, { chefs: payload }, { timeout: 8000 });
    const data      = pythonRes.data;

    if (data?.ranked?.length > 0) {
      return res.json(data);
    }
    console.warn('[Recommend] Python returned empty ranked array — using fallback');
  } catch (err) {
    console.warn(`[Recommend] Python call failed: ${err.message} — using fallback`);
  }

  res.json(buildFallbackJson(chefs));
};

// ── GET /api/recommend/debug ───────────────────────────
const debugRecommend = async (req, res) => {
  try {
    const chefs = await Chef.find().lean();
    const info  = [];
    for (const chef of chefs) {
      const ratings  = await safeRatings(chef._id);
      const comments = ratings.map(r => ({ stars: r.stars, comment: r.comment || '(no comment)' }));
      info.push({
        id:          chef._id,
        name:        chef.name        || '',
        avgRating:   chef.avgRating   || 0,
        ratingCount: chef.ratingCount || 0,
        ratingsInDB: ratings.length,
        comments,
      });
    }
    res.json({ totalChefs: chefs.length, pythonServiceUrl: PYTHON_URL, chefs: info });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRecommendedChefs, debugRecommend };
