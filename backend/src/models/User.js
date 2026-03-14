const { database } = require('../config/db');

const getUserById = async (userId, transaction = database) => {
  const query = {
    sql: 'SELECT * FROM Users WHERE user_id = @userId',
    params: { userId }
  };
  const [rows] = await transaction.run(query);
  if (rows.length === 0) return null;
  return rows[0].toJSON(); // Convert Spanner row to plain JS object
};

const createUser = async (user, transaction = database) => {
  const mutation = {
    user_id: user.user_id,
    region: user.region || 'global',
    wallet_balance: user.wallet_balance || 0,
    created_at: 'spanner.commit_timestamp()'
  };
  
  // if passing a transaction object, use it; otherwise use the generic table insert
  if (transaction && transaction.insert) {
       transaction.insert('Users', mutation);    
  } else {
       await database.table('Users').insert(mutation);
  }
};

const deleteManyUsers = async () => {
   // Warning: Spanner doesn't have a simple TRUNCATE, so we use DML
   await database.runTransactionAsync(async (transaction) => {
       await transaction.runUpdate({
           sql: 'DELETE FROM Users WHERE true'
       });
       await transaction.commit();
   });
};

const insertManyUsers = async (users) => {
    const mutations = users.map(user => ({
        user_id: user.user_id,
        region: user.region || 'global',
        wallet_balance: user.wallet_balance || 0,
        // Using spanner.commit_timestamp triggers auto-commit timestamp on insert
        created_at: 'spanner.commit_timestamp()'
    }));
    await database.table('Users').insert(mutations);
}


module.exports = {
  getUserById,
  createUser,
  deleteManyUsers,
  insertManyUsers
};
