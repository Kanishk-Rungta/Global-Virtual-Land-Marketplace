# Google Cloud Spanner Schema

## 1. Users Table

CREATE TABLE Users (
user_id STRING(36) NOT NULL,
region STRING(20),
wallet_balance FLOAT64,
created_at TIMESTAMP
) PRIMARY KEY(user_id);

---

## 2. Lands Table

CREATE TABLE Lands (
land_id STRING(36) NOT NULL,
owner_id STRING(36),
price FLOAT64,
status STRING(20),
version INT64
) PRIMARY KEY(land_id);

version column is used for optimistic concurrency control.

---

## 3. Transactions Table

CREATE TABLE Transactions (
txn_id STRING(36) NOT NULL,
buyer_id STRING(36),
seller_id STRING(36),
land_id STRING(36),
amount FLOAT64,
status STRING(20),
created_at TIMESTAMP
) PRIMARY KEY(txn_id);

---

## 4. Auctions Table

CREATE TABLE Auctions (
auction_id STRING(36) NOT NULL,
land_id STRING(36),
highest_bid FLOAT64,
highest_bidder STRING(36),
end_time TIMESTAMP
) PRIMARY KEY(auction_id);
