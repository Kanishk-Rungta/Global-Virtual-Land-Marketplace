# Google Cloud Spanner Setup Guide

This guide provides step-by-step instructions to set up the Google Cloud Spanner instance required for the Global Virtual Land Marketplace.

## 1. Google Cloud Console Setup

1.  **Create/Select a Project**: Go to the [GCP Console](https://console.cloud.google.com/) and create a new project named `virtual-land-marketplace`.
2.  **Enable Spanner API**: Navigate to **Spanner** in the sidebar and click **Enable**.
3.  **Create Instance**:
    *   Click **Create Instance**.
    *   **Instance Name**: `global-instance`
    *   **Instance ID**: `global-instance`
    *   **Configuration**: Select **Multi-region** (e.g., `nam-eur-asia1` for true global distribution, or a Regional config for testing).
    *   **Compute Capacity**: 100 Processing Units (the minimum for testing).

## 2. Create Database and Schema

1.  **Create Database**:
    *   Inside your instance, click **Create Database**.
    *   **Database Name**: `land-db`
2.  **Define Schema**:
    During database creation (or via the **Spanner Studio** tab later), execute the following DDL:

```sql
CREATE TABLE Users (
  user_id STRING(36) NOT NULL,
  region STRING(20),
  wallet_balance FLOAT64,
  created_at TIMESTAMP
) PRIMARY KEY(user_id);

CREATE TABLE Lands (
  land_id STRING(36) NOT NULL,
  owner_id STRING(36),
  price FLOAT64,
  status STRING(20),
  version INT64
) PRIMARY KEY(land_id);

CREATE TABLE Transactions (
  txn_id STRING(36) NOT NULL,
  buyer_id STRING(36),
  seller_id STRING(36),
  land_id STRING(36),
  amount FLOAT64,
  status STRING(20),
  created_at TIMESTAMP
) PRIMARY KEY(txn_id);

CREATE TABLE Auctions (
  auction_id STRING(36) NOT NULL,
  land_id STRING(36),
  highest_bid FLOAT64,
  highest_bidder STRING(36),
  end_time TIMESTAMP
) PRIMARY KEY(auction_id);
```

## 3. Local Authentication (Application Default Credentials)

Instead of using a service account key file, use the Google Cloud CLI to authenticate your local environment:

1.  **Install Google Cloud CLI**: Download and install from [cloud.google.com/sdk](https://cloud.google.com/sdk/docs/install).
2.  **Initialize CLI**:
    ```bash
    gcloud init
    ```
    Follow the prompts to log in and select your project (`virtual-land-marketplace`).
3.  **Set Application Default Credentials (ADC)**:
    Run the following command to allow the Node.js Spanner client to use your user credentials:
    ```bash
    gcloud auth application-default login
    ```
    This will open a browser for login. Once complete, a credentials file will be stored locally in a standard location (e.g., `%APPDATA%\gcloud\application_default_credentials.json` on Windows), and the backend will automatically find it.

## 4. Backend Environment Configuration

Create a `.env` file in the `backend/` directory. Note that we **do not** need a `GOOGLE_APPLICATION_CREDENTIALS` path when using ADC.

```env
GOOGLE_CLOUD_PROJECT="virtual-land-marketplace"
SPANNER_INSTANCE="global-instance"
SPANNER_DATABASE="land-db"
```

## 5. Seed Initial Data (Optional)

You can use Spanner Studio to insert a few test users and lands:

```sql
INSERT INTO Users (user_id, region, wallet_balance, created_at) 
VALUES ('user-test-1', 'asia', 5000.0, PENDING_COMMIT_TIMESTAMP());

-- Seed a 10x10 grid of lands
-- (You can run multiple inserts for different IDs like land-0-0, land-0-1, etc.)
INSERT INTO Lands (land_id, owner_id, price, status, version) 
VALUES ('land-0-0', NULL, 100.0, 'available', 1);
```

## 6. Testing the Connection

Once the backend is configured, run:
```bash
cd backend
npm start
```
The server will log `Spanner connection successful` if everything is configured correctly.
