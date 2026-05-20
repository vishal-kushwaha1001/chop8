/**
 * Converted from: backendChop8.controller.ProfileController
 * @RequestMapping /api/profile
 */
const User = require('../models/User');
const Chef = require('../models/Chef');

const nvl = v => (v != null ? v : '');

// ── GET /api/profile/:role/:id ─────────────────────────
const getProfile = async (req, res) => {
  try {
    const { role, id } = req.params;

    if (role.toLowerCase() === 'chef') {
      const c = await Chef.findById(id);
      if (!c) return res.status(404).json({ error: 'Chef not found' });
      return res.json({
        id:             c._id,
        name:           c.name,
        email:          c.email,
        mobile:         nvl(c.mobile),
        address:        nvl(c.address),
        photo:          nvl(c.photo),
        specialisation: nvl(c.specialisation),
        pricePerDay:    c.pricePerDay    ?? 0.0,
        avgRating:      c.avgRating      ?? 0.0,
        ratingCount:    c.ratingCount,
        role:           c.role,
      });
    }

    const u = await User.findById(id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({
      id:          u._id,
      name:        u.name,
      email:       u.email,
      mobile:      nvl(u.mobile),
      address:     nvl(u.address),
      photo:       nvl(u.photo),
      avgRating:   u.avgRating   ?? 0.0,
      ratingCount: u.ratingCount,
      role:        u.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PUT /api/profile/:role/:id ─────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { role, id } = req.params;
    const { name, mobile, address, photo, specialisation, pricePerDay } = req.body;

    if (role.toLowerCase() === 'chef') {
      const c = await Chef.findById(id);
      if (!c) return res.status(404).json({ error: 'Chef not found' });

      if (name           != null) c.name           = name;
      if (mobile         != null) c.mobile         = mobile;
      if (address        != null) c.address        = address;
      if (photo          != null) c.photo          = photo === '' ? null : photo;
      if (specialisation != null) c.specialisation = specialisation === '' ? null : specialisation;
      if (pricePerDay    != null) {
        const p = parseFloat(pricePerDay);
        if (!isNaN(p) && p >= 0) c.pricePerDay = p;
      }
      const saved = await c.save();
      return res.json({
        message:        'Profile updated successfully',
        name:           saved.name,
        mobile:         nvl(saved.mobile),
        address:        nvl(saved.address),
        photo:          nvl(saved.photo),
        specialisation: nvl(saved.specialisation),
        pricePerDay:    saved.pricePerDay ?? 0.0,
        avgRating:      saved.avgRating   ?? 0.0,
        ratingCount:    saved.ratingCount,
      });
    }

    const u = await User.findById(id);
    if (!u) return res.status(404).json({ error: 'User not found' });

    if (name    != null) u.name    = name;
    if (mobile  != null) u.mobile  = mobile;
    if (address != null) u.address = address;
    if (photo   != null) u.photo   = photo === '' ? null : photo;
    const saved = await u.save();
    res.json({
      message:     'Profile updated successfully',
      name:        saved.name,
      mobile:      nvl(saved.mobile),
      address:     nvl(saved.address),
      photo:       nvl(saved.photo),
      avgRating:   saved.avgRating   ?? 0.0,
      ratingCount: saved.ratingCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProfile, updateProfile };
