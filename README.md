# Global Virtual Land Marketplace

A full-stack distributed system demonstrating a virtual land marketplace with strong consistency and real-time updates.

## Architecture

- **Frontend**: React, Three.js (Holographic Visualization), Socket.io Client
- **Backend**: Node.js, Express, Socket.io, MongoDB (Mongoose)
- **Database**: MongoDB (Supports persistence and transactions)

## Prerequisites

- **Node.js**: (v16+)
- **MongoDB**: (v4.0+). **Important**: A **Replica Set** is required to support multi-document transactions (used for land purchases). For local development, you can use [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server) or a local replica set.

## Setup & Running

### 1. Backend Setup

```bash
cd backend
npm install
```

**Configure Environment Variables:**
Create a `.env` file in the `backend/` directory (or update the existing one):
```env
MONGODB_URI=mongodb://localhost:27017/global-virtual-land-marketplace?replicaSet=rs0
PORT=5001
REGION=asia
```

**Seed the Database:**
This will create the 10x10 land grid and test users in your MongoDB instance.
```bash
npm run seed
```

**Running Regional Servers (Optional Simulation):**
You can simulate multiple regional nodes by running them on different ports:

- **Asia (Port 5001):** `npm run start:asia`
- **US (Port 5002):** `npm run start:us`
- **EU (Port 5003):** `npm run start:eu`

*Note: By default, the frontend expects these specific ports for its region-switching feature.*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```
The frontend will start on [http://localhost:3000](http://localhost:3000).

---

## Usage Guide

1. **Explore the Grid**: Use your mouse to rotate and zoom the 3D land map.
2. **Select Land**: Click on any **Green** (Available) plot to view its details in the right panel.
3. **Acquire Land**: Click **"ACQUIRE LAND"** to purchase. The state will update to **Red** (Owned) across all connected devices in real-time.
4. **Multi-Device Sync**: Open the app in two different browser windows or devices. When you buy land in one, the other will show a notification and update the map immediately via Socket.io.
5. **Manual Refresh**: Use the **"REFRESH"** button in the navbar to manually re-sync the state with the database at any time.

## Key Features Implemented

- **Atomic Transactions**: Land purchases (updating buyer balance, seller balance, and land ownership) are handled as a single transaction in MongoDB.
- **Persistence**: All data is saved to MongoDB. Unlike the previous version, restarting the server will not lose your progress.
- **Optimistic Concurrency**: Uses a `version` field in the schema to prevent race conditions during simultaneous purchase attempts.
- **Real-time Engine**: Socket.io broadcasts ownership changes (`land-update`) to all clients instantly.
- **Metaverse Visuals**: High-fidelity 3D map built with Three.js and React Three Fiber.
