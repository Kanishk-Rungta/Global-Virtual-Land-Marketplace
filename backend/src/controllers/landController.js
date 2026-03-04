const { database } = require('../config/spanner');
const { Spanner } = require('@google-cloud/spanner');
const { v4: uuidv4 } = require('uuid');
const { emitUpdate } = require('../services/socket');

const LAND_TABLE = 'Lands';
const USER_TABLE = 'Users';
const TXN_TABLE = 'Transactions';
const AUCTION_TABLE = 'Auctions';

// Helper to format query results
const formatRows = (rows) => rows.map(row => row.toJSON());

exports.getLands = async (req, res) => {
  try {
    const query = {
      sql: 'SELECT * FROM Lands',
    };
    const [rows] = await database.run(query);
    res.json(formatRows(rows));
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

  try {
    const result = await database.runTransactionAsync(async (transaction) => {
      // 1. Read Land
      const [landRows] = await transaction.run({
        sql: `SELECT * FROM ${LAND_TABLE} WHERE land_id = @landId`,
        params: { landId }
      });

      if (landRows.length === 0) throw new Error('Land not found');
      const land = landRows[0].toJSON();

      if (land.status !== 'available' && land.status !== 'for_sale') {
        throw new Error('Land not available');
      }

      if (land.owner_id === buyerId) throw new Error('Already owned');

      const price = land.price;

      // 2. Read Buyer
      const [buyerRows] = await transaction.run({
        sql: `SELECT * FROM ${USER_TABLE} WHERE user_id = @buyerId`,
        params: { buyerId }
      });

      if (buyerRows.length === 0) throw new Error('Buyer not found');
      const buyer = buyerRows[0].toJSON();

      if (buyer.wallet_balance < price) throw new Error('Insufficient funds');

      // 3. Update Buyer Balance
      transaction.update(USER_TABLE, {
        user_id: buyerId,
        wallet_balance: buyer.wallet_balance - price
      });

      // 4. Update Seller (if exists)
      if (land.owner_id) {
        const [sellerRows] = await transaction.run({
          sql: `SELECT * FROM ${USER_TABLE} WHERE user_id = @ownerId`,
          params: { ownerId: land.owner_id }
        });
        if (sellerRows.length > 0) {
          const seller = sellerRows[0].toJSON();
          transaction.update(USER_TABLE, {
            user_id: land.owner_id,
            wallet_balance: seller.wallet_balance + price
          });
        }
      }

      // 5. Update Land
      const newVersion = (parseInt(land.version) || 0) + 1;
      transaction.update(LAND_TABLE, {
        land_id: landId,
        owner_id: buyerId,
        status: 'owned',
        version: newVersion
      });

      // 6. Record Transaction
      const txnId = uuidv4();
      transaction.insert(TXN_TABLE, {
        txn_id: txnId,
        buyer_id: buyerId,
        seller_id: land.owner_id || 'system',
        land_id: landId,
        amount: price,
        status: 'completed',
        created_at: Spanner.timestamp(new Date())
      });

      return { txnId, newVersion };
    });

    // Notify clients
    emitUpdate('land-update', {
      landId,
      ownerId: buyerId,
      status: 'owned',
      version: result.newVersion
    });

    res.json({ success: true, txnId: result.txnId });

  } catch (err) {
    console.error('Transaction Error:', err.message);
    res.status(400).json({ error: err.message });
  }
};
