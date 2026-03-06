const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Land = require('../models/Land');
const { v4: uuidv4 } = require('uuid');

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany({});
  await Land.deleteMany({});

  // Seed Users
  const user1_id = uuidv4();
  const user2_id = uuidv4();

  const users = await User.insertMany([
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
  ]);

  console.log('Users seeded');

  // Seed Lands (e.g., a 10x10 grid)
  const lands = [];
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      lands.push({
        land_id: `land-${x}-${y}`,
        owner_id: null,
        price: Math.floor(Math.random() * 500) + 100,
        status: 'available',
        version: 0,
      });
    }
  }

  await Land.insertMany(lands);
  console.log('Lands seeded');

  console.log('Seeding complete. Use these user IDs for testing:');
  console.log('User 1 (US):', user1_id);
  console.log('User 2 (EU):', user2_id);

  process.exit();
};

seedData();
