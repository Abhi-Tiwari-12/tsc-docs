require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors());                          // allow requests from the frontend
app.use(express.json({ limit: '10mb' })); // parse JSON bodies (flows can be large)

// ── Health check (must be before the * catch-all) ──────────────────
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── API routes ──────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Serve the frontend from /client ────────────────────────────────
app.use(express.static(path.join(__dirname, '../client')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ── Connect to MongoDB then start server ────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  Server running → http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
