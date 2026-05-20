require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const authRoutes      = require('./routes/authRoutes');
const chefRoutes      = require('./routes/chefRoutes');
const bookingRoutes   = require('./routes/bookingRoutes');
const paymentRoutes   = require('./routes/paymentRoutes');
const profileRoutes   = require('./routes/profileRoutes');
const ratingRoutes    = require('./routes/ratingRoutes');
const recommendRoutes = require('./routes/recommendRoutes');

const app = express();

// ── Middleware ─────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'] }));
app.use(express.json({ limit: '10mb' })); // allow base64 photo uploads

// ── DB ─────────────────────────────────────────────────
connectDB();

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api',           chefRoutes);
app.use('/api',           bookingRoutes);
app.use('/api/payment',   paymentRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/ratings',   ratingRoutes);
app.use('/api/recommend', recommendRoutes);

// ── Health check ───────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'Chop8 API running' }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Chop8 server running on port ${PORT}`));
