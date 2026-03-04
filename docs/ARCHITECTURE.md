# System Architecture

## High-Level Flow

Frontend → Regional Backend → Google Spanner

---

## Frontend

Tech:
- React
- Three.js
- Axios
- Socket.io-client

Purpose:
- Render virtual land map
- Display ownership
- Handle buy/auction interactions
- Listen for real-time updates

---

## Backend

Tech:
- Node.js
- Express
- Socket.io
- Google Spanner Client

3 simulated regional servers:
- Asia (port 5001)
- US (port 5002)
- EU (port 5003)

All connect to same Spanner instance.

---

## Real-Time Flow

When land ownership changes:
- Backend emits event via Socket.io
- All connected clients update UI

---

## Distributed Concepts Demonstrated

- Multi-region architecture
- ACID transactions
- Strong consistency
- Concurrency control
- Conflict resolution
- Fault tolerance