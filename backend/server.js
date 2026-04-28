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
        const [rows] = await db.execute('SELECT * FROM auctions ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auctions/:id', async (req, res) => {
    try {
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
        const [rows] = await db.execute('SELECT * FROM leaderboard LIMIT 10');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

initDB().then(() => {
    app.listen(port, () => console.log(`🚀 Backend running on port ${port}`));
});
