const { database } = require('../config/db');
const { getUserById, createUser } = require('../models/User');
const { getAllLands, getLandById } = require('../models/Land');
const { createTransaction } = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');
const { emitUpdate } = require('../services/socket');

exports.getLands = async (req, res) => {
  try {
    const lands = await getAllLands();
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

  try {
    const txnId = uuidv4();
    let newVersion = null;

    // Use Spanner's runTransactionAsync for atomic multi-document updates
    await database.runTransactionAsync(async (transaction) => {
      try {
        // 1. Read Land
        const land = await getLandById(landId, transaction);

        if (!land) throw new Error('Land not found in database');

        if (land.status !== 'available' && land.status !== 'for_sale') {
          throw new Error(`Land is ${land.status}, not available for purchase`);
        }

        if (land.owner_id === buyerId) throw new Error('You already own this land');

        const price = land.price;

        // 2. Read Buyer
        let buyer = await getUserById(buyerId, transaction);
        
        let newBuyerCreated = false;
        
        if (!buyer) {
          console.log(`User ${buyerId} not found, creating new user for demo...`);
          buyer = {
            user_id: buyerId,
            region: 'global',
            wallet_balance: 10000 // Start with $10k
          };
          
          await createUser(buyer, transaction);
          newBuyerCreated = true;
        }

        if (buyer.wallet_balance < price) {
          throw new Error(`Insufficient funds. Price: $${price}, Balance: $${buyer.wallet_balance}`);
        }

        // 3. Update Buyer Balance
        const updatedBuyerBalance = buyer.wallet_balance - price;
        transaction.update('Users', {
            user_id: buyerId,
            wallet_balance: updatedBuyerBalance
        });

        // 4. Update Seller (if exists)
        const oldOwnerId = land.owner_id;
        if (oldOwnerId && oldOwnerId !== 'system') {
          const seller = await getUserById(oldOwnerId, transaction);
          if (seller) {
            const updatedSellerBalance = seller.wallet_balance + price;
            transaction.update('Users', {
                user_id: oldOwnerId,
                wallet_balance: updatedSellerBalance
            });
          }
        }

        // 5. Update Land
        newVersion = (land.version || 0) + 1;
        
        // Spanner throws an error / auto-aborts if you rewrite rows that changed beneath you.
        // It provides optimistic concurrency by default through its Read-Write Transactions.
        transaction.update('Lands', {
            land_id: landId,
            owner_id: buyerId,
            status: 'owned',
            version: newVersion
        });

        // 6. Record Transaction
        await createTransaction({
            txn_id: txnId,
            buyer_id: buyerId,
            seller_id: oldOwnerId || 'system',
            land_id: landId,
            amount: price,
            status: 'completed'
        }, transaction);

        // Commit execution
        await transaction.commit();
        console.log(`Transaction successful: ${txnId}`);
      } catch (err) {
        throw err;
      }
    });

    // Notify clients via Socket.io
    emitUpdate('land-update', {
      landId,
      ownerId: buyerId,
      status: 'owned',
      version: newVersion
    });

    res.json({ success: true, txnId });

  } catch (err) {
    console.error('Purchase Failed:', err.message);
    res.status(400).json({ error: err.message });
  }
};
