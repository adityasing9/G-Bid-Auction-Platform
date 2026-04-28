# 💎 BidCrypt: Decentralized Sealed-Bid Auction Platform

![BidCrypt Banner](https://img.shields.io/badge/Status-Live_on_Sepolia-success?style=for-the-badge)
![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

BidCrypt is a next-generation decentralized application (dApp) that utilizes a **Commit-Reveal cryptographic scheme** to conduct secure, manipulation-free auctions on the Ethereum blockchain.

Traditional transparent auctions are susceptible to front-running, bid-sniping, and market manipulation. BidCrypt solves this by allowing users to submit mathematically concealed bids that are impossible to decrypt until the designated reveal phase.

---

## 🏗️ Architecture & Tech Stack

This project is a fully robust, production-ready Web3 ecosystem distributed across specialized platforms:

### 1. Smart Contracts (Blockchain Layer)
*   **Language:** Solidity
*   **Network:** Ethereum Sepolia Testnet
*   **Core Logic:** Handles the locking of ETH deposits, verifying `keccak256` hash commitments, and executing the final winner determination.

### 2. Frontend (Client Layer)
*   **Framework:** React.js + Vite
*   **Styling:** Tailwind CSS (Modern "Midnight/Cyber" Glassmorphism UI)
*   **Web3 Integration:** `ethers.js` (v6) + MetaMask
*   **Hosting:** **Vercel**

### 3. Backend (API & Sync Layer)
*   **Environment:** Node.js + Express
*   **Hosting:** **Render.com**
*   **Functionality:** Acts as an indexer and caching layer, syncing on-chain auction data (titles, descriptions, categories, and deadlines) to provide the frontend with lightning-fast dashboard loading without hammering the RPC node.

### 4. Database (Storage Layer)
*   **Provider:** **Supabase (PostgreSQL)**
*   **Usage:** Relational mapping of Active Auctions, Bids, and Leaderboard statistics.

---

## 🔐 The Commit-Reveal Mechanism Explained

BidCrypt ensures fairness through a strict two-phase process:

1.  **Commit Phase:** Bidders decide on a bid amount and generate a secure random `secret`. The frontend hashes the bid and the secret together: `keccak256(abi.encodePacked(bidAmount, secret))`. Only this mathematical hash and the ETH deposit are sent to the blockchain. **Nobody (not even the creator) knows the actual bid amount.**
2.  **Reveal Phase:** Once the commit phase ends, bidders submit their raw `bidAmount` and `secret` back to the contract. The contract re-hashes them. If the new hash matches the committed hash, the bid is validated and unsealed.
3.  **Finalization:** The highest valid revealed bid wins the asset. All losing deposits are refunded. If a user fails to reveal their bid, their deposit is forfeited to prevent griefing.

---

## 🚀 Live Deployment

The platform is fully configured for production deployment:
*   **Vercel (Frontend):** Configured with `vercel.json` for seamless React Router SPAs.
*   **Render (Backend):** Connected directly to GitHub for continuous deployment.
*   **Supabase (DB):** Production PostgreSQL instance serving the `auctions` and `bids` relational schema.

---

## 💻 Local Developer Setup

If you want to run BidCrypt locally, follow these steps:

### Prerequisites
*   Node.js (v18+)
*   MetaMask Browser Extension (configured to Sepolia Testnet)
*   A Supabase Account

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```
Start the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```

### 3. Smart Contract Deployment (Optional)
If you wish to deploy your own instance of the contract:
```bash
cd contracts
npm install
npx hardhat run scripts/deploy.js --network sepolia
```
*Note: Ensure you update `CONTRACT_ADDRESS` in `frontend/src/contracts/contractData.js` if you deploy a new contract.*

---

## 🛡️ Security Features
*   **Reentrancy Protection:** Utilizes OpenZeppelin's `ReentrancyGuard` to prevent recursive withdrawal attacks.
*   **Pull-Over-Push Payments:** Refunds must be actively withdrawn by users, preventing malicious contracts from halting the auction via fallback execution reverts.
*   **Local Storage Persistence:** Cryptographic secrets are safely stored in the user's browser `localStorage` during the commit phase, ensuring they are not lost before the reveal phase.

---
*Built for the future of decentralized asset exchange.*
