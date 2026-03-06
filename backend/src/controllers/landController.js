const mongoose = require('mongoose');
const User = require('../models/User');
const Land = require('../models/Land');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');
const { emitUpdate } = require('../services/socket');

exports.getLands = async (req, res) => {
  try {
    const lands = await Land.find({});
    res.json(lands);
  } catch (err) {
    console.error('Error fetching lands:', err);
    res.status(500).send('Error fetching lands');
  }
};

exports.buyLand = async (req, res) => {
  const { buyerId, landId } = req.body;

  if (!buyerId || !landId) {
    return res.status(400).json({ error: 'Missing buyerId or landId' });
  }

  console.log(`Processing purchase: Buyer ${buyerId} -> Land ${landId}`);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Read/Verify Land
    const land = await Land.findOne({ land_id: landId }).session(session);

    if (!land) throw new Error('Land not found in database');

    if (land.status !== 'available' && land.status !== 'for_sale') {
      throw new Error(`Land is ${land.status}, not available for purchase`);
    }

    if (land.owner_id === buyerId) throw new Error('You already own this land');

    const price = land.price;

    // 2. Read Buyer (Auto-create if not exists for demo convenience)
    let buyer = await User.findOne({ user_id: buyerId }).session(session);

    if (!buyer) {
      console.log(`User ${buyerId} not found, creating new user for demo...`);
      buyer = new User({
        user_id: buyerId,
        region: 'global',
        wallet_balance: 10000 // Start with $10k
      });
      await buyer.save({ session });
    }

    if (buyer.wallet_balance < price) {
      throw new Error(`Insufficient funds. Price: $${price}, Balance: $${buyer.wallet_balance}`);
    }

    // 3. Update Buyer Balance
    buyer.wallet_balance -= price;
    await buyer.save({ session });

    // 4. Update Seller (if exists)
    const oldOwnerId = land.owner_id;
    if (oldOwnerId && oldOwnerId !== 'system') {
      const seller = await User.findOne({ user_id: oldOwnerId }).session(session);
      if (seller) {
        seller.wallet_balance += price;
        await seller.save({ session });
      }
    }

    // 5. Update Land
    const newVersion = (land.version || 0) + 1;
    land.owner_id = buyerId;
    land.status = 'owned';
    land.version = newVersion;
    await land.save({ session });

    // 6. Record Transaction
    const txnId = uuidv4();
    const newTransaction = new Transaction({
      txn_id: txnId,
      buyer_id: buyerId,
      seller_id: oldOwnerId || 'system',
      land_id: landId,
      amount: price,
      status: 'completed'
    });
    await newTransaction.save({ session });

    // Commit Transaction
    await session.commitTransaction();
    console.log(`Transaction successful: ${txnId}`);

    // Notify clients via Socket.io
    emitUpdate('land-update', {
      landId,
      ownerId: buyerId,
      status: 'owned',
      version: newVersion
    });

    res.json({ success: true, txnId });

  } catch (err) {
    // Abort Transaction
    if (session.inTransaction()) {
        await session.abortTransaction();
    }
    
    console.error('Purchase Failed:', err.message);
    
    // Check for transaction errors
    if (err.message.includes('transaction') || err.message.includes('replica set')) {
        res.status(400).json({ 
            error: "Spanner Transaction Error: Multi-region consensus required. Ensure your database cluster is healthy." 
        });
    } else {
        res.status(400).json({ error: err.message });
    }
  } finally {
    session.endSession();
  }
};
