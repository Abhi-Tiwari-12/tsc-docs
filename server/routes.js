const express = require('express');
const router  = express.Router();
const Item    = require('./models');

function isCastError(err) {
  return err.name === 'CastError' && err.kind === 'ObjectId';
}

// ── GET /api/items ──────────────────────────────────────────────────
router.get('/items', async (req, res) => {
  try {
    const filter = req.query.type ? { type: req.query.type } : {};
    const items  = await Item.find(filter).sort({ updatedAt: -1 });
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

module.exports = router;