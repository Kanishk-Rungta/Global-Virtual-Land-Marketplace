const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txn_id: { type: String, required: true, unique: true },
  buyer_id: { type: String, required: true },
  seller_id: { type: String, required: true },
  land_id: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
