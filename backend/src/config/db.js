const { Spanner } = require('@google-cloud/spanner');
require('dotenv').config();

const projectId = process.env.SPANNER_PROJECT_ID || 'your-project-id';
const instanceId = process.env.SPANNER_INSTANCE_ID || 'your-instance-id';
const databaseId = process.env.SPANNER_DATABASE_ID || 'your-database-id';

// Instantiates a client
const spanner = new Spanner({ projectId });
// Gets a reference to a Cloud Spanner instance and database
const instance = spanner.instance(instanceId);
const database = instance.database(databaseId);

// Verify connection
const connectDB = async () => {
  try {
    const [exists] = await database.exists();
    if (!exists) {
        console.warn('Spanner database does not exist. Ensure schema is initialized.');
    } else {
        console.log('Spanner connected successfully');
    }
  } catch (err) {
    console.error('Spanner connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, database };
