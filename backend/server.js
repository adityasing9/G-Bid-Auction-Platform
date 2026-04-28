require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const morgan = require('morgan');
const { ethers } = require('ethers');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// DB Connection
let db;
async function initDB() {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'auction_db'
        });
        console.log('✅ MySQL Connected');
    } catch (err) {
        console.error('❌ DB Connection Error:', err.message);
    }
}

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Auctions API
app.get('/api/auctions', async (req, res) => {
    try {
        if (!db) {
            // Mock data for demo if DB is not connected
            return res.json([{
                id: 0,
                creator_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                title: 'Genesis Cyber NFT',
                description: 'The first asset ever auctioned on BidCrypt.',
                asset_type: 'Digital',
                min_bid: '0.1',
                commit_deadline: new Date(Date.now() + 600000).toISOString(),
                reveal_deadline: new Date(Date.now() + 1200000).toISOString(),
                phase: 'Commit'
            }]);
        }
        const [rows] = await db.execute('SELECT * FROM auctions ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auctions/:id', async (req, res) => {
    try {
        if (!db) {
            return res.json({
                id: req.params.id,
                creator_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                title: 'Genesis Cyber NFT',
                description: 'The first asset ever auctioned on BidCrypt.',
                asset_type: 'Digital',
                min_bid: '0.1',
                commit_deadline: new Date(Date.now() + 600000).toISOString(),
                reveal_deadline: new Date(Date.now() + 1200000).toISOString(),
                phase: 'Commit'
            });
        }
        const [rows] = await db.execute('SELECT * FROM auctions WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bids API
app.post('/api/bids', async (req, res) => {
    const { auction_id, bidder_address, commit_hash, deposit_amount } = req.body;
    try {
        if (!db) return res.json({ message: 'Bid recorded (Mock Mode)' });
        await db.execute(
            'INSERT INTO bids (auction_id, bidder_address, commit_hash, deposit_amount) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE commit_hash = ?, deposit_amount = ?',
            [auction_id, bidder_address, commit_hash, deposit_amount, commit_hash, deposit_amount]
        );
        res.json({ message: 'Bid recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sync from Blockchain (Mocked for now, will be triggered by event listener)
app.post('/api/sync/auction', async (req, res) => {
    const { id, creator, title, description, asset_type, min_bid, commit_deadline, reveal_deadline } = req.body;
    try {
        if (!db) return res.json({ success: true, message: 'Synced (Mock Mode)' });
        await db.execute(
            'INSERT INTO auctions (id, creator_address, title, description, asset_type, min_bid, commit_deadline, reveal_deadline) VALUES (?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?), FROM_UNIXTIME(?)) ON DUPLICATE KEY UPDATE phase = phase',
            [id, creator, title, description, asset_type, min_bid, commit_deadline, reveal_deadline]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        if (!db) {
            return res.json([
                { wallet_address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', wins: 12, total_bids: 18, win_rate: 66.7 },
                { wallet_address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', wins: 8, total_bids: 14, win_rate: 57.1 },
                { wallet_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', wins: 5, total_bids: 11, win_rate: 45.5 },
                { wallet_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', wins: 3, total_bids: 9, win_rate: 33.3 },
                { wallet_address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', wins: 2, total_bids: 7, win_rate: 28.6 }
            ]);
        }
        const [rows] = await db.execute('SELECT * FROM leaderboard LIMIT 10');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

initDB().then(() => {
    app.listen(port, () => console.log(`🚀 Backend running on port ${port}`));
});
