# Global Virtual Land Marketplace

A full-stack distributed system demonstrating a virtual land marketplace with strong consistency using Google Cloud Spanner.

## Architecture

- **Frontend**: React, Three.js (Visualization), Socket.io Client
- **Backend**: Node.js, Express, Socket.io, Google Cloud Spanner
- **Database**: Google Cloud Spanner (Multi-region simulation)

## Prerequisites

- Node.js (v16+)
- Google Cloud Project with Spanner Instance
- Google Cloud SDK (authenticated)

## Setup

### 1. Database Setup

Ensure your Google Cloud Spanner instance is ready.
Update `backend/src/config/spanner.js` or set environment variables:
- `GOOGLE_CLOUD_PROJECT`
- `SPANNER_INSTANCE`
- `SPANNER_DATABASE`

Schema (see `docs/DATABASE.md`):
- Tables: `Users`, `Lands`, `Transactions`, `Auctions`

### 2. Backend Setup

```bash
cd backend
npm install
```

**Running Regional Servers:**

Open 3 terminal tabs to simulate regional servers:

**Asia (Port 5001):**
```bash
npm run start:asia
```

**US (Port 5002):**
```bash
npm run start:us
```

**EU (Port 5003):**
```bash
npm run start:eu
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will start on http://localhost:3000.

## Usage

1. Open the frontend.
2. Select a region from the dropdown (this switches the API endpoint).
3. View the 10x10 Land Grid.
   - Green: Available
   - Red: Owned
4. Click on a green land plot to select it.
5. Click "Buy Land" in the sidebar.
6. The ownership will update in real-time across all connected clients (open multiple tabs to test).

## Key Features Implemented

- **Distributed Transactions**: Buying land uses Spanner transactions to ensure atomicity.
- **Optimistic Concurrency**: Uses `version` column to prevent lost updates.
- **Real-time Updates**: Socket.io broadcasts ownership changes to all clients.
- **Regional Simulation**: Frontend can switch between backend servers.
