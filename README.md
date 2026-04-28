<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=220&section=header&text=BidCrypt%20Auction%20Platform&fontSize=42&fontColor=00ffe1&animation=fadeIn&fontAlignY=35"/>
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?color=00FFE1&size=22&center=true&vCenter=true&width=650&lines=Decentralized+Sealed-Bid+Auctions;Commit-Reveal+Cryptography;Manipulation-Free+Bidding;Built+with+React+%2B+Solidity"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white"/>
</p>

---

## 🌐 Live App

<p align="center">
  🔗 https://bidcrypt.vercel.app
</p>

<p align="center">
  <a href="https://bidcrypt.vercel.app">
    <img src="https://img.shields.io/badge/Open%20in%20Browser-00C9FF?style=for-the-badge&logo=google-chrome&logoColor=black"/>
  </a>
</p>

---

## 🧠 Overview

**BidCrypt** is a next-generation decentralized application (dApp) deployed on the **Ethereum Sepolia Testnet**. 

Traditional transparent auctions are highly susceptible to front-running, bid-sniping, and market manipulation. BidCrypt solves these inherent Web3 issues by utilizing a **Commit-Reveal cryptographic scheme**. Bidders submit mathematically concealed hashes rather than plain-text bids, ensuring absolute fairness and privacy until the auction officially closes.

---

## 🔐 The Commit-Reveal Mechanism

BidCrypt ensures fairness through a strict two-phase process running directly on the blockchain:

1. **Commit Phase (Sealing the Bid):**
   When a user places a bid, the frontend generates a secure random `secret`. It mathematically hashes the bid amount and the secret together: `keccak256(abi.encodePacked(bidAmount, secret))`. Only this hash (and the ETH deposit) is sent to the smart contract. *Nobody—not even the auction creator—knows the true bid.*
2. **Reveal Phase (Unsealing the Bid):**
   Once the commit deadline passes, bidders submit their raw `bidAmount` and `secret`. The smart contract re-hashes them. If the hash matches the one stored during the Commit Phase, the bid is officially validated.
3. **Finalization (Winner Determination):**
   The highest valid revealed bid wins. All losing deposits are automatically made available for withdrawal via a secure Pull-over-Push refund pattern.

---

## ✨ Features

<p align="center">
  <img src="https://img.shields.io/badge/Commit--Reveal_Cryptography-00ffe1?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Anti--Front--Running-00c9ff?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Cloud_Data_Sync-ffffff?style=for-the-badge"/>
</p>

### 🛡️ Smart Contract Security
*   **Reentrancy Guards:** Protects against recursive withdrawal attacks during refunds.
*   **Pull-Over-Push Payments:** Prevents malicious actors from halting auctions by reverting forced ETH transfers.
*   **Strict Timestamps:** Enforces rigid Commit and Reveal deadlines entirely on-chain.

### ⚡ Hybrid Web3 Architecture
*   **Blockchain State:** Secures all financial logic, deposits, hashes, and winner calculation.
*   **Off-chain Indexer (Render + Supabase):** A Node.js backend instantly syncs metadata (titles, descriptions, categories) to a PostgreSQL database, allowing the React frontend to load complex dashboards instantly without heavy RPC node calls.

### 🎨 Premium User Experience
*   **Glassmorphism UI:** A sleek, "Modern Midnight" design system utilizing Tailwind CSS.
*   **Local Secret Persistence:** Cryptographic secrets are safely cached in browser `localStorage`, ensuring users don't lose their keys before the reveal phase.

---

## 🛠 Architecture & Tech Stack

```text
Blockchain Layer → Solidity (Ethereum Sepolia Testnet)
Client Layer     → React.js + Vite + Tailwind CSS + Ethers.js (Vercel)
API / Sync Layer → Node.js + Express (Render)
Storage Layer    → Supabase PostgreSQL
```

---

## ⚙️ Local Setup

```bash
git clone https://github.com/adityasing9/G-Bid-Auction-Platform.git
cd G-Bid-Auction-Platform

# 1. Backend Setup
cd backend
npm install
npm run dev

# 2. Frontend Setup
cd ../frontend
npm install
npm run dev
```

---

## 🔐 Secrets (Backend `.env`)

To run the indexer backend locally, create a `.env` in the `backend` folder:

```env
PORT=5000
SUPABASE_URL="your_supabase_project_url"
SUPABASE_KEY="your_supabase_anon_key"
```

---

## 👨‍💻 Author

**Aditya Singh**  
https://github.com/adityasing9

---

<p align="center">
  ⭐ Star this repo if you found it useful
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=120&section=footer"/>
</p>
