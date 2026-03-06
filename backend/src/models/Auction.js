const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  auction_id: { type: String, required: true, unique: true },
  land_id: { type: String, required: true },
  highest_bid: { type: Number, default: 0 },
  highest_bidder: { type: String, default: null },
  end_time: { type: Date, required: true },
});

module.exports = mongoose.model('Auction', auctionSchema);
