# Project: Global Distributed Virtual Land Marketplace

## Objective

Build a full-stack globally distributed metaverse marketplace system that ensures strongly consistent virtual land ownership using Google Cloud Spanner.

---

## System Components

1. React Frontend (Metaverse UI)
2. Regional Backend Servers (Asia, US, EU)
3. Google Cloud Spanner (Multi-region)
4. Real-time update layer (Socket.io)

---

## Frontend Requirements

- Display grid of lands (e.g., 10x10 map)
- Show:
  - Owner
  - Price
  - Status
- Allow:
  - Buy land
  - Start auction
  - Place bid
- Real-time ownership updates via WebSocket
- Allow region selection (Asia / US / EU)

---

## Backend Requirements

- REST API endpoints:
  - POST /users
  - GET /lands
  - POST /lands/buy
  - POST /auction/start
  - POST /auction/bid

- Spanner integration
- Transaction retry logic
- Optimistic concurrency control

---

## Critical Requirement: Buy Land

Must execute inside single Spanner transaction:

1. Validate land availability
2. Validate wallet balance
3. Deduct buyer balance
4. Credit seller
5. Update ownership
6. Insert transaction record
7. Commit atomically

Retry up to 3 times if aborted.