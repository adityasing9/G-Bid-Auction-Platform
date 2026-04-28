-- MySQL Schema for Sealed-Bid Auction

CREATE DATABASE IF NOT EXISTS auction_db;
USE auction_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auctions table
CREATE TABLE IF NOT EXISTS auctions (
    id INT PRIMARY KEY, -- Matches Blockchain Auction ID
    creator_address VARCHAR(42) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    asset_type VARCHAR(50),
    min_bid DECIMAL(36, 18) NOT NULL,
    commit_deadline TIMESTAMP NOT NULL,
    reveal_deadline TIMESTAMP NOT NULL,
    phase ENUM('Created', 'Commit', 'Reveal', 'Ended') DEFAULT 'Created',
    winner_address VARCHAR(42),
    winning_bid DECIMAL(36, 18),
    price_paid DECIMAL(36, 18),
    finalized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    bidder_address VARCHAR(42) NOT NULL,
    commit_hash VARCHAR(66) NOT NULL,
    deposit_amount DECIMAL(36, 18) NOT NULL,
    revealed_amount DECIMAL(36, 18),
    is_revealed BOOLEAN DEFAULT FALSE,
    reveal_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id),
    UNIQUE KEY unique_bid (auction_id, bidder_address)
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    auction_id INT,
    wallet_address VARCHAR(42),
    data JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    wallet_address,
    COUNT(CASE WHEN winner_address = wallet_address THEN 1 END) as wins,
    COUNT(id) as total_participated,
    (COUNT(CASE WHEN winner_address = wallet_address THEN 1 END) / COUNT(id)) * 100 as win_rate
FROM (
    SELECT bidder_address as wallet_address, a.id, a.winner_address 
    FROM bids b
    JOIN auctions a ON b.auction_id = a.id
) as history
GROUP BY wallet_address;
