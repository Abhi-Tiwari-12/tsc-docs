const mongoose = require('mongoose');

// ── Shared base fields ──────────────────────────────────────────────
const baseFields = {
  title:     { type: String, default: 'Untitled', trim: true },
  type:      { type: String, enum: ['flows', 'documentation'], required: true },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
};

// ── Flow node sub-schema ────────────────────────────────────────────
const NodeSchema = new mongoose.Schema({
  id:    { type: String, required: true },
  type:  { type: String, default: 'process' },
  title: { type: String, default: '' },
  body:  { type: String, default: '' },
  x:     { type: Number, default: 0 },
  y:     { type: Number, default: 0 },
}, { _id: false });

// ── Flow edge sub-schema ────────────────────────────────────────────
const EdgeSchema = new mongoose.Schema({
  id:   { type: String, required: true },
  from: { type: String, required: true },
  to:   { type: String, required: true },
}, { _id: false });

// ── Main Item schema ────────────────────────────────────────────────
const ItemSchema = new mongoose.Schema({
  ...baseFields,
  // documentation fields
  content: { type: String, default: '' },
  // flow fields
  nodes:   { type: [NodeSchema], default: [] },
  edges:   { type: [EdgeSchema], default: [] },
  zoom:    { type: Number, default: 1 },
  panX:    { type: Number, default: 0 },
  panY:    { type: Number, default: 0 },
}, {
  timestamps: true, // adds createdAt + updatedAt automatically
  versionKey: false,
});

module.exports = mongoose.model('Item', ItemSchema);
