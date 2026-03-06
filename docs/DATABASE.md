# MongoDB Schema (Migration from Spanner)

## 1. Users Collection

```javascript
{
  user_id: { type: String, required: true, unique: true },
  region: { type: String, maxLength: 20 },
  wallet_balance: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
}
```

---

## 2. Lands Collection

```javascript
{
  land_id: { type: String, required: true, unique: true },
  owner_id: { type: String, default: null },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'for_sale', 'owned'], default: 'available' },
  version: { type: Number, default: 0 }
}
```

---

## 3. Transactions Collection

```javascript
{
  txn_id: { type: String, required: true, unique: true },
  buyer_id: { type: String, required: true },
  seller_id: { type: String, required: true },
  land_id: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
  created_at: { type: Date, default: Date.now }
}
```

---

## 4. Auctions Collection

```javascript
{
  auction_id: { type: String, required: true, unique: true },
  land_id: { type: String, required: true },
  highest_bid: { type: Number, default: 0 },
  highest_bidder: { type: String, default: null },
  end_time: { type: Date, required: true }
}
```

---

## Implementation Details

- **Concurrency**: Optimistic concurrency control is managed via the `version` field.
- **Transactions**: Multi-document transactions are used in `landController.js` to ensure atomicity when purchasing land. (Requires MongoDB Replica Set).
- **Real-time**: Socket.io is used to broadcast ownership updates (`land-update`) to all connected clients.
