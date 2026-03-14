const { connectDB } = require('../config/db');
const initSchema = require('../models/SpannerDB');
const { insertManyUsers, deleteManyUsers } = require('../models/User');
const { insertManyLands, deleteManyLands } = require('../models/Land');
const { v4: uuidv4 } = require('uuid');

const seedData = async () => {
  await connectDB();
  
  // Ensure schema exists before populating
  await initSchema();

  // Clear existing data (in a real scenario, use extreme caution)
  console.log('Clearing existing data...');
  await deleteManyUsers();
  await deleteManyLands();

  // Seed Users
  const user1_id = uuidv4();
  const user2_id = uuidv4();

  const usersToInsert = [
    {
      user_id: user1_id,
      region: 'us',
      wallet_balance: 10000,
    },
    {
      user_id: user2_id,
      region: 'eu',
      wallet_balance: 5000,
    },
    {
      user_id: 'system',
      region: 'global',
      wallet_balance: 0,
    }
  ];

  await insertManyUsers(usersToInsert);
  console.log('Users seeded');

  // Seed Lands (e.g., a 10x10 grid)
  const landsToInsert = [];
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      landsToInsert.push({
        land_id: `land-${x}-${y}`,
        owner_id: null,
        price: Math.floor(Math.random() * 500) + 100,
        status: 'available',
        version: 0,
      });
    }
  }

  await insertManyLands(landsToInsert);
  console.log('Lands seeded');

  console.log('Seeding complete. Use these user IDs for testing:');
  console.log('User 1 (US):', user1_id);
  console.log('User 2 (EU):', user2_id);

  process.exit();
};

seedData();
