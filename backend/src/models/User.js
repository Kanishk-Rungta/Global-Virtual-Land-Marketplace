const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  region: { type: String, maxLength: 20 },
  wallet_balance: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
