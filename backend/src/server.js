require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const initSchema = require('./models/SpannerDB');
const { initSocket } = require('./services/socket');

const PORT = process.env.PORT || 5000;
const REGION = process.env.REGION || 'default';

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start Server
const start = async () => {
  console.log(`Starting server in region: ${REGION}`);
  
  // Check Spanner Connection
  await connectDB();
  
  // Ensure schema exists
  await initSchema();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [Region: ${REGION}]`);
  });
};

start();
