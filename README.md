# The Base Standard (TBS)

> **Verifiable Reputation Protocol for the Base L2 Ecosystem.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Stack: Next.js](https://img.shields.io/badge/Stack-Next.js_15-black)](https://nextjs.org/)
[![Network: Base](https://img.shields.io/badge/Network-Base_Mainnet-blue)](https://base.org)

**The Base Standard** is a production-grade reputation system that quantifies on-chain activity into “Provable Value Contribution” (PVC) scores. It transitions reputation from simple linear tenure (account age) to a weighted metric satisfying **Economic Impact**, **Social Trust**, and **Consistency**.

---

## 🏗 System Architecture

The project operates as a **Layered Monorepo** designed for manual control and high availability.

### 1. **Smart Contracts (The Logic Layer)**
*   **Path:** `/foundry`
*   **Framework:** Foundry (Solidity 0.8.23 / Solady)
*   **Core Contracts:**
    *   `ReputationRegistry.sol`: Stores user PVC scores and verifies Oracle signatures via EIP-712.
    *   `TierNFT.sol`: ERC-1155 badges gated by reputation tier (Tourist, Resident, Builder, Based, Legend).

### 2. **Frontend & Client (The UI Layer)**
*   **Path:** `/src`
*   **Framework:** Next.js 15.1.6 (App Router)
*   **Styling:** Tailwind CSS 3.4 + Custom Cyberpunk Theme
*   **Web3 Integration:** OnchainKit 0.37.5, Wagmi v2, Viem.
*   **Key Features:**
    *   Coinbase Smart Wallet integration.
    *   Farcaster Frame v2 support (`/api/frame`).
    *   Zero-latency Server Component Leaderboard.

### 3. **Data Infrastructure (The Backend)**
*   **Path:** `/ponder` & `/src/lib/db`
*   **Indexer:** Ponder (Syncs Registry events to Postgres/SQLite).
*   **Database:** Prisma ORM (SQLite for Dev, Postgres Connection Pooling for Prod).

---

## 🚀 Getting Started

### Prerequisites
*   Node.js v20+
*   Foundry (`forge`, `cast`, `anvil`)
*   Farcaster Account (for Frame verification)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/7finger0x/t-b-s.git
    cd t-b-s
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root:
    ```env
    # Database
    DATABASE_URL="file:./dev.db"
    
    # OnchainKit / Coinbase
    NEXT_PUBLIC_ONCHAINKIT_API_KEY="your_api_key"
    NEXT_PUBLIC_WC_PROJECT_ID="your_walletconnect_id"
    
    # Foundry / Ponder
    PONDER_RPC_URL="https://mainnet.base.org"
    PRIVATE_KEY="0x..." # For deploying contracts
    ```

4.  **Initialize Database**
    ```bash
    npx prisma migrate dev --name init
    ```

### Running Locally

**1. Start the Frontend App**
```bash
npm run dev
# Opens http://localhost:3000
```

**2. Run Smart Contract Tests**
```bash
cd foundry
forge test
```

**3. Start the Indexer (Optional)**
```bash
cd ponder
npm run dev
```

---

## 📜 Smart Contract Deployment

We adhere to a strict **"Manual Verify"** policy. Deployment is handled via Foundry scripts.

```bash
cd foundry

# 1. Compile
forge build

# 2. Deploy to Base Sepolia (Testnet)
forge script script/Deploy.s.sol:DeployScript --rpc-url base_sepolia --broadcast --verify

# 3. Deploy to Base Mainnet
forge script script/Deploy.s.sol:DeployScript --rpc-url base --broadcast --verify
```

*Note: Ensure you have `ETHERSCAN_API_KEY` set for verification.*

---

## 📐 Scoring Algorithm (The 9 Metrics)

The **PVC Score (0-1000)** is derived from three vectors:

1.  **Economic (Max 2500 pts -> Scaled)**:
    *   Gas Burn (Logarithmic Scale).
    *   Liquidity Provided (>7 days).
2.  **Social (Max 2000 pts -> Scaled)**:
    *   Farcaster OpenRank (Top 1% = 1200 pts).
    *   Zora Mints (Curatorial Proof).
3.  **Tenure (Max 1865 pts -> Scaled)**:
    *   Active Months (>5 txs/month).
    *   Consistency Streaks.

### Tiers

| Tier | PVC Score | Status |
| :--- | :--- | :--- |
| **TOURIST** | 0 - 350 | Visitor / Sybil Risk |
| **RESIDENT** | 351 - 650 | Established User |
| **BUILDER** | 651 - 850 | Value Creator |
| **BASED** | 851 - 950 | **Target Standard** |
| **LEGEND** | 951+ | Ecosystem Elite |

---

## 🤝 Contributing

**Philosophy:** Manual Build Only.
*   ❌ Do not use CLI scaffolding wizards.
*   ✅ Write strict Typescript interfaces.
*   ✅ Maintain 100% test coverage for logic (`src/lib/scoring`).

---

## 📄 License

MIT © [The Base Standard](https://base-standard.xyz)
