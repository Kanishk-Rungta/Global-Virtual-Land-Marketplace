const { database } = require('../config/db');

const createTransaction = async (txn, transaction = database) => {
    const mutation = {
        txn_id: txn.txn_id,
        buyer_id: txn.buyer_id,
        seller_id: txn.seller_id,
        land_id: txn.land_id,
        amount: txn.amount,
        status: txn.status || 'completed',
        created_at: 'spanner.commit_timestamp()'
    };
    
    if (transaction && transaction.insert) {
        transaction.insert('Transactions', mutation);    
    } else {
        await database.table('Transactions').insert(mutation);
    }
};

module.exports = {
   createTransaction
};
