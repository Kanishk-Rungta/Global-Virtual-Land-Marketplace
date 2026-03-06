const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  land_id: { type: String, required: true, unique: true },
  owner_id: { type: String, default: null },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'for_sale', 'owned'], default: 'available' },
  version: { type: Number, default: 0 },
});

module.exports = mongoose.model('Land', landSchema);
