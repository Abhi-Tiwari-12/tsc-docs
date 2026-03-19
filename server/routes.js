const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const Item = require('./models');

function isCastError(err) {
  return err.name === 'CastError' && err.kind === 'ObjectId';
}

// ── GET /api/items ──────────────────────────────────────────────────
router.get('/items', async (req, res) => {
  try {
    const filter = req.query.type ? { type: req.query.type } : {};
    const items = await Item.find(filter).sort({ updatedAt: -1 });
    res.json({ ok: true, data: items });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── GET /api/items/:id ──────────────────────────────────────────────
router.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, data: item });
  } catch (err) {
    if (isCastError(err)) return res.status(404).json({ ok: false, error: 'Not found' });
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── POST /api/items ─────────────────────────────────────────────────
router.post('/items', async (req, res) => {
  try {
    const { title, type, url, method, description } = req.body;
    if (!type) return res.status(400).json({ ok: false, error: 'type is required' });
    const item = await Item.create({ title, type, url, method, description });
    res.status(201).json({ ok: true, data: item });
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ ok: false, error: err.message });
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── PATCH /api/items/:id ────────────────────────────────────────────
router.patch('/items/:id', async (req, res) => {
  try {
    const allowed = [
      'title', 'content',
      'nodes', 'edges', 'zoom', 'panX', 'panY',
      'url', 'method', 'description',
      'sheetData', 'sheetNames',
    ];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, data: item });
  } catch (err) {
    if (isCastError(err)) return res.status(404).json({ ok: false, error: 'Not found' });
    if (err.name === 'ValidationError') return res.status(400).json({ ok: false, error: err.message });
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── DELETE /api/items/:id ───────────────────────────────────────────
router.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, message: 'Deleted' });
  } catch (err) {
    if (isCastError(err)) return res.status(404).json({ ok: false, error: 'Not found' });
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════
//  SHARING ROUTES
// ══════════════════════════════════════════════════════════════════════

// ── POST /api/items/:id/share ───────────────────────────────────────
// Generates a share token (idempotent — calling again returns the same link).
// Only documents can be shared.
router.post('/items/:id/share', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    if (item.type !== 'documentation') {
      return res.status(400).json({ ok: false, error: 'Only documents can be shared' });
    }

    // Reuse existing token so the link never changes between calls
    if (!item.shareToken) {
      item.shareToken = crypto.randomBytes(24).toString('hex'); // 48-char hex
      await item.save();
    }

    const url = `https://tsc-docs.onrender.com/shared/${item.shareToken}`;
    res.json({ ok: true, data: { token: item.shareToken, url } });
  } catch (err) {
    if (isCastError(err)) return res.status(404).json({ ok: false, error: 'Not found' });
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── DELETE /api/items/:id/share ─────────────────────────────────────
// Revokes the share link — the token is wiped, old links stop working.
router.delete('/items/:id/share', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: { shareToken: null } },
      { new: true }
    );
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, data: { revoked: true } });
  } catch (err) {
    if (isCastError(err)) return res.status(404).json({ ok: false, error: 'Not found' });
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── GET /api/shared/:token ──────────────────────────────────────────
// Public — no auth. Returns only title + content + updatedAt.
// Called by shared.html to render the document.
router.get('/shared/:token', async (req, res) => {
  try {
    const item = await Item.findOne(
      { shareToken: req.params.token, type: 'documentation' },
      'title content updatedAt'   // projection — never leak other fields
    );
    if (!item) {
      return res.status(404).json({ ok: false, error: 'Document not found or link has been revoked' });
    }
    res.json({ ok: true, data: item });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
