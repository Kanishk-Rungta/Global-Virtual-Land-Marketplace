const { database } = require('../config/db');

const initSchema = async () => {
  // Define DDL statements
  const statements = [
    `CREATE TABLE Users (
      user_id STRING(MAX) NOT NULL,
      region STRING(20),
      wallet_balance INT64,
      created_at TIMESTAMP OPTIONS (allow_commit_timestamp=true)
    ) PRIMARY KEY (user_id)`,
    `CREATE TABLE Lands (
      land_id STRING(MAX) NOT NULL,
      owner_id STRING(MAX),
      price INT64 NOT NULL,
      status STRING(20),
      version INT64
    ) PRIMARY KEY (land_id)`,
    `CREATE TABLE Transactions (
      txn_id STRING(MAX) NOT NULL,
      buyer_id STRING(MAX) NOT NULL,
      seller_id STRING(MAX) NOT NULL,
      land_id STRING(MAX) NOT NULL,
      amount INT64 NOT NULL,
      status STRING(20),
      created_at TIMESTAMP OPTIONS (allow_commit_timestamp=true)
    ) PRIMARY KEY (txn_id)`,
    `CREATE TABLE Auctions (
      auction_id STRING(MAX) NOT NULL,
      land_id STRING(MAX) NOT NULL,
      highest_bid INT64,
      highest_bidder STRING(MAX),
      end_time TIMESTAMP
    ) PRIMARY KEY (auction_id)`
  ];

  try {
    const [operation] = await database.updateSchema(statements);
    console.log('Waiting for schema updates to complete...');
    await operation.promise();
    console.log('Schema updated successfully.');
  } catch (err) {
    if (err.message.includes('Duplicate name')) {
        console.log('Schema already initialized.');
    } else {
        console.error('Error updating schema:', err.message);
    }
  }
};

module.exports = initSchema;
