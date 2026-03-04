const { Spanner } = require('@google-cloud/spanner');

const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'virtual-land-marketplace';
const instanceId = process.env.SPANNER_INSTANCE || 'global-instance';
const databaseId = process.env.SPANNER_DATABASE || 'land-db';

console.log(`Initializing Spanner Client for Project: ${projectId}, Instance: ${instanceId}, Database: ${databaseId}`);

const spanner = new Spanner({
  projectId: projectId,
});

const instance = spanner.instance(instanceId);
const database = instance.database(databaseId);

// Basic check function
const checkConnection = async () => {
  try {
    const [rows] = await database.run('SELECT 1');
    console.log('Spanner connection successful:', rows);
    return true;
  } catch (error) {
    console.error('Spanner connection failed:', error.message);
    // In a real scenario, we might retry or fail fast depending on requirements.
    // For this demo, we log and proceed (server might start but fail requests).
    return false;
  }
};

module.exports = {
  database,
  checkConnection
};
