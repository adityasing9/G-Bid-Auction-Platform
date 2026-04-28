# 🏁 G-Bid: Decentralized Sealed-Bid Auction Platform

G-Bid is a production-ready, decentralized auction platform designed to prevent front-running and encourage truthful bidding through a **Commit-Reveal mechanism** and **Vickrey (Second-Price) logic**.

---

## 🚀 Key Features

*   **Decentralized Privacy**: Hashed bids (keccak256) ensure total secrecy during the commit phase.
*   **Vickrey Pricing**: Winners pay the second-highest bid, mathematically incentivizing honest valuation.
*   **AI Bidding Assistant**: Real-time statistical analysis providing safe vs. aggressive bid ranges and win probabilities.
*   **Anti-Sniping**: Automatically extends reveal deadlines if late-stage activity is detected.
*   **Cyber-Punk UI**: Futuristic dark theme with neon yellow/green accents and smooth glassmorphism effects.
*   **Secure Funds**: Pull-payment refund system eliminates reentrancy risks.

---

## 🛠️ Tech Stack

*   **Blockchain**: Solidity, Hardhat, Ethers.js
*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons
*   **Backend**: Node.js, Express, MySQL
*   **AI Service**: Python, FastAPI, NumPy

---

## ⚙️ Setup Instructions

### 1. Smart Contracts
```bash
cd contracts
npm install
# Run a local hardhat node
npx hardhat node
# In another terminal
npx hardhat run scripts/deploy.js --network localhost
```

### 2. Backend
```bash
cd backend
npm install
# Setup MySQL and update .env
npm run dev
```

### 3. AI Service
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔄 System Flow (Demo)

1.  **Connect**: User connects MetaMask to the platform.
2.  **Create**: Auctioneer creates an auction for a digital asset.
3.  **Analyze**: Bidders use the **AI Assistant** to find the optimal bid range.
4.  **Commit**: Bidders submit a hashed bid and deposit funds.
5.  **Reveal**: Once the commit phase ends, bidders reveal their bid + secret.
6.  **Finalize**: Contract determines the winner (highest bidder) and price (second highest).
7.  **Withdraw**: Losers and the auctioneer withdraw their respective funds safely.

---

## 🛡️ Security Features

*   **Checks-Effects-Interactions**: All contract state changes happen before external calls.
*   **Commit Validation**: Rejects reveals that don't match the original hash.
*   **Phase Enforced**: Logic strictly separates commit, reveal, and end phases.

---

Built with ❤️ for the G-Bid Hackathon.
