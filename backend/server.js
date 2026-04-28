require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { ethers } = require('ethers');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// DB Connection - Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase;
if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Connected to Supabase');
} else {
    console.warn('⚠️ Supabase URL or Key is missing. Running in Mock Mode.');
}

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Auctions API
app.get('/api/auctions', async (req, res) => {
    try {
        if (!supabase) {
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
        const { data, error } = await supabase
            .from('auctions')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/auctions/:id', async (req, res) => {
    try {
        if (!supabase) {
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
        const { data, error } = await supabase
            .from('auctions')
            .select('*')
            .eq('id', req.params.id)
            .single();
            
        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' }); // No rows returned
            throw error;
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bids API
app.post('/api/bids', async (req, res) => {
    const { auction_id, bidder_address, commit_hash, deposit_amount } = req.body;
    try {
        if (!supabase) return res.json({ message: 'Bid recorded (Mock Mode)' });
        
        const { error } = await supabase
            .from('bids')
            .upsert({
                auction_id,
                bidder_address,
                commit_hash,
                deposit_amount
            }, { onConflict: 'auction_id, bidder_address' });
            
        if (error) throw error;
        res.json({ message: 'Bid recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sync from Blockchain
app.post('/api/sync/auction', async (req, res) => {
    console.log('📥 Sync Request:', req.body);
    const { id, title, description, category, minBid, commitDuration, revealDuration, account } = req.body;

    // Validation
    if (!id || !title || !account || !minBid) {
        return res.status(400).json({ error: 'Missing required auction fields' });
    }

    try {
        if (!supabase) return res.json({ success: true, message: 'Mock Sync Success' });

        const now = Math.floor(Date.now() / 1000);
        const commitDeadline = now + parseInt(commitDuration);
        const revealDeadline = commitDeadline + parseInt(revealDuration);

        // Convert epoch timestamps to ISO format for Postgres TIMESTAMPTZ
        const commitISO = new Date(commitDeadline * 1000).toISOString();
        const revealISO = new Date(revealDeadline * 1000).toISOString();

        const { error } = await supabase
            .from('auctions')
            .upsert({
                id,
                creator_address: account,
                title,
                description,
                asset_type: category,
                min_bid: minBid,
                commit_deadline: commitISO,
                reveal_deadline: revealISO
            }, { onConflict: 'id' });

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Sync Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Backend running on port ${port}`);
});
