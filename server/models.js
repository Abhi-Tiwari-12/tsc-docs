const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, default: 'process' },
  title: { type: String, default: '' },
  body: { type: String, default: '' },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
}, { _id: false });

const EdgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
}, { _id: false });

const ItemSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled', trim: true },
  type: { type: String, required: true },
  // documentation
  content: { type: String, default: '' },
  // flows
  nodes: { type: [NodeSchema], default: [] },
  edges: { type: [EdgeSchema], default: [] },
  zoom: { type: Number, default: 1 },
  panX: { type: Number, default: 0 },
  panY: { type: Number, default: 0 },
  // api playground
  url: { type: String, default: '' },
  method: { type: String, default: 'GET' },
  description: { type: String, default: '' },
  // sheets
  sheetData: { type: mongoose.Schema.Types.Mixed, default: {} },
  sheetNames: { type: [String], default: ['Sheet1'] },
  // sharing — null = not shared, 48-char hex = active link (never expires)
  shareToken: { type: String, default: null, index: true },
}, {
  timestamps: true,
  versionKey: false,
  strict: false,
});

module.exports = mongoose.model('Item', ItemSchema);
