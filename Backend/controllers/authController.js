/**
 * Converted from:
 *   backendChop8.controller.AuthController  (@RequestMapping /api/auth)
 *   backendChop8.service.AuthService
 *
 * Spring Security BCryptPasswordEncoder(10) → bcryptjs with saltRounds=10
 */
const bcrypt = require('bcryptjs');
const User   = require('../models/User');
const Chef   = require('../models/Chef');

// ── POST /api/auth/signup ──────────────────────────────
// Body: { name, email, password, mobile, address, role, pricePerDay? }
const signup = async (req, res) => {
  try {
    const { name, email, password, mobile, address, role = 'customer', pricePerDay } = req.body;

    // Check duplicate email in the correct collection
    if (role.toLowerCase() === 'chef') {
      const exists = await Chef.findOne({ email });
      if (exists) return res.status(400).json({ error: 'Email already registered' });

      const price    = parseFloat(pricePerDay) || 0.0;
      const hashed   = await bcrypt.hash(password, 10);
      const saved    = await Chef.create({ name, email, password: hashed, mobile, address, role: 'chef', pricePerDay: price });

      return res.json({
        message:    'Account created successfully',
        userId:     saved._id,
        name:       saved.name,
        role:       saved.role,
        pricePerDay: saved.pricePerDay,
      });
    } else {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ error: 'Email already registered' });

      const hashed = await bcrypt.hash(password, 10);
      const saved  = await User.create({ name, email, password: hashed, mobile, address, role: 'customer' });

      return res.json({
        message: 'Account created successfully',
        userId:  saved._id,
        name:    saved.name,
        role:    saved.role,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/auth/login ───────────────────────────────
// Checks chef collection first, then user collection
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check chef first
    const chef = await Chef.findOne({ email });
    if (chef && await bcrypt.compare(password, chef.password)) {
      return res.json({
        message:    'Login successful',
        userId:     chef._id,
        name:       chef.name,
        email:      chef.email,
        mobile:     chef.mobile  || '',
        address:    chef.address || '',
        role:       chef.role,
        pricePerDay: chef.pricePerDay,
      });
    }

    // Check user
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      return res.json({
        message: 'Login successful',
        userId:  user._id,
        name:    user.name,
        email:   user.email,
        mobile:  user.mobile  || '',
        address: user.address || '',
        role:    user.role,
      });
    }

    res.status(401).json({ error: 'Invalid email or password' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { signup, login };
