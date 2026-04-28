// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SealedBidAuction
 * @notice A sealed-bid auction contract with commit-reveal mechanism and Vickrey (second-price) pricing.
 * @dev Implements:
 *   - Commit-reveal bidding (keccak256 hashed bids)
 *   - Vickrey auction (winner pays second-highest bid)
 *   - Pull-payment refund system (no reentrancy risk)
 *   - Anti-sniping (extends reveal phase on late reveals)
 *   - Emergency pause
 *   - Checks-Effects-Interactions pattern throughout
 */
contract SealedBidAuction {
    // ============================================================
    //                        TYPES
    // ============================================================

    enum AuctionPhase { Created, Commit, Reveal, Ended }

    struct Auction {
        uint256 id;
        address creator;
        string title;
        string description;
        string assetType;
        uint256 minBid;
        uint256 commitDeadline;
        uint256 revealDeadline;
        uint256 antiSnipeExtension; // seconds to extend reveal on late reveal
        AuctionPhase phase;
        address winner;
        uint256 winningBid;      // highest bid
        uint256 secondHighestBid; // Vickrey price (winner pays this)
        uint256 totalCommits;
        uint256 totalReveals;
        bool finalized;
    }

    struct Commit {
        bytes32 hash;
        uint256 deposit;
        bool revealed;
        uint256 revealedAmount;
        uint256 revealTimestamp;
    }

    // ============================================================
    //                     STATE VARIABLES
    // ============================================================

    address public owner;
    bool public paused;

    uint256 public nextAuctionId;
    mapping(uint256 => Auction) public auctions;
    // auctionId => bidder => Commit
    mapping(uint256 => mapping(address => Commit)) public commits;
    // auctionId => list of bidders who committed
    mapping(uint256 => address[]) public auctionBidders;
    // Pending withdrawals (pull-payment pattern)
    mapping(address => uint256) public pendingWithdrawals;

    // ============================================================
    //                         EVENTS
    // ============================================================

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed creator,
        string title,
        string assetType,
        uint256 minBid,
        uint256 commitDeadline,
        uint256 revealDeadline
    );

    event BidCommitted(
        uint256 indexed auctionId,
        address indexed bidder,
        bytes32 commitHash,
        uint256 deposit
    );

    event BidRevealed(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid,
        uint256 pricePaid // Vickrey second-price
    );

    event RevealExtended(
        uint256 indexed auctionId,
        uint256 newRevealDeadline
    );

    event Withdrawal(address indexed bidder, uint256 amount);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    // ============================================================
    //                       MODIFIERS
    // ============================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier auctionExists(uint256 _auctionId) {
        require(_auctionId < nextAuctionId, "Auction does not exist");
        _;
    }

    // ============================================================
    //                      CONSTRUCTOR
    // ============================================================

    constructor() {
        owner = msg.sender;
        paused = false;
        nextAuctionId = 0;
    }

    // ============================================================
    //                   AUCTION MANAGEMENT
    // ============================================================

    /**
     * @notice Creates a new sealed-bid auction.
     * @param _title Title of the auction
     * @param _description Description of the auctioned asset
     * @param _assetType Category of the asset
     * @param _minBid Minimum bid amount in wei
     * @param _commitDuration Duration of commit phase in seconds
     * @param _revealDuration Duration of reveal phase in seconds
     * @param _antiSnipeSeconds Seconds to extend reveal on late reveal
     */
    function createAuction(
        string calldata _title,
        string calldata _description,
        string calldata _assetType,
        uint256 _minBid,
        uint256 _commitDuration,
        uint256 _revealDuration,
        uint256 _antiSnipeSeconds
    ) external whenNotPaused returns (uint256) {
        require(_commitDuration >= 60, "Commit phase too short");
        require(_revealDuration >= 60, "Reveal phase too short");
        require(_minBid > 0, "Min bid must be > 0");

        uint256 auctionId = nextAuctionId++;
        uint256 commitDeadline = block.timestamp + _commitDuration;
        uint256 revealDeadline = commitDeadline + _revealDuration;

        auctions[auctionId] = Auction({
            id: auctionId,
            creator: msg.sender,
            title: _title,
            description: _description,
            assetType: _assetType,
            minBid: _minBid,
            commitDeadline: commitDeadline,
            revealDeadline: revealDeadline,
            antiSnipeExtension: _antiSnipeSeconds,
            phase: AuctionPhase.Commit,
            winner: address(0),
            winningBid: 0,
            secondHighestBid: 0,
            totalCommits: 0,
            totalReveals: 0,
            finalized: false
        });

        emit AuctionCreated(
            auctionId,
            msg.sender,
            _title,
            _assetType,
            _minBid,
            commitDeadline,
            revealDeadline
        );

        return auctionId;
    }

    // ============================================================
    //                     COMMIT PHASE
    // ============================================================

    /**
     * @notice Commit a hashed bid. Hash = keccak256(abi.encodePacked(bidAmount, secret)).
     * @dev Deposit must be >= minBid. Excess is fine (hides true bid).
     * @param _auctionId Auction to bid on
     * @param _commitHash keccak256 hash of (bidAmount, secret)
     */
    function commitBid(uint256 _auctionId, bytes32 _commitHash)
        external
        payable
        whenNotPaused
        auctionExists(_auctionId)
    {
        Auction storage auction = auctions[_auctionId];

        require(block.timestamp <= auction.commitDeadline, "Commit phase ended");
        require(auction.phase == AuctionPhase.Commit || auction.phase == AuctionPhase.Created, "Not in commit phase");
        require(msg.value >= auction.minBid, "Deposit below minimum bid");
        require(commits[_auctionId][msg.sender].hash == bytes32(0), "Already committed");

        // Effects
        commits[_auctionId][msg.sender] = Commit({
            hash: _commitHash,
            deposit: msg.value,
            revealed: false,
            revealedAmount: 0,
            revealTimestamp: 0
        });

        auctionBidders[_auctionId].push(msg.sender);
        auction.totalCommits++;

        // Ensure phase is Commit
        if (auction.phase == AuctionPhase.Created) {
            auction.phase = AuctionPhase.Commit;
        }

        emit BidCommitted(_auctionId, msg.sender, _commitHash, msg.value);
    }

    // ============================================================
    //                     REVEAL PHASE
    // ============================================================

    /**
     * @notice Reveal a previously committed bid.
     * @param _auctionId Auction ID
     * @param _bidAmount The actual bid amount (in wei)
     * @param _secret The secret used when hashing
     */
    function revealBid(uint256 _auctionId, uint256 _bidAmount, bytes32 _secret)
        external
        whenNotPaused
        auctionExists(_auctionId)
    {
        Auction storage auction = auctions[_auctionId];
        Commit storage commit = commits[_auctionId][msg.sender];

        // Timing checks
        require(block.timestamp > auction.commitDeadline, "Commit phase not ended");
        require(block.timestamp <= auction.revealDeadline, "Reveal phase ended");

        // Validity checks
        require(commit.hash != bytes32(0), "No commit found");
        require(!commit.revealed, "Already revealed");
        require(_bidAmount >= auction.minBid, "Bid below minimum");
        require(commit.deposit >= _bidAmount, "Deposit less than bid");

        // Verify hash
        bytes32 expectedHash = keccak256(abi.encodePacked(_bidAmount, _secret));
        require(expectedHash == commit.hash, "Hash mismatch - invalid reveal");

        // Effects (before any interactions)
        commit.revealed = true;
        commit.revealedAmount = _bidAmount;
        commit.revealTimestamp = block.timestamp;
        auction.totalReveals++;

        // Update phase
        if (auction.phase == AuctionPhase.Commit) {
            auction.phase = AuctionPhase.Reveal;
        }

        // Update winner tracking (Vickrey: track top 2 bids)
        if (_bidAmount > auction.winningBid) {
            // New highest bid
            auction.secondHighestBid = auction.winningBid;
            auction.winningBid = _bidAmount;

            // Refund previous winner's excess deposit
            if (auction.winner != address(0)) {
                Commit storage prevWinnerCommit = commits[_auctionId][auction.winner];
                pendingWithdrawals[auction.winner] += prevWinnerCommit.deposit;
            }

            auction.winner = msg.sender;
        } else if (_bidAmount > auction.secondHighestBid) {
            // New second highest
            auction.secondHighestBid = _bidAmount;
            // This bidder loses, refund their deposit
            pendingWithdrawals[msg.sender] += commit.deposit;
        } else {
            // Lower bid, refund deposit
            pendingWithdrawals[msg.sender] += commit.deposit;
        }

        // Anti-sniping: extend reveal if near deadline
        if (auction.antiSnipeExtension > 0 &&
            auction.revealDeadline - block.timestamp < 120) // within 2 min of deadline
        {
            auction.revealDeadline += auction.antiSnipeExtension;
            emit RevealExtended(_auctionId, auction.revealDeadline);
        }

        emit BidRevealed(_auctionId, msg.sender, _bidAmount);
    }

    // ============================================================
    //                    FINALIZE AUCTION
    // ============================================================

    /**
     * @notice End the auction after reveal phase. Winner pays second-highest price (Vickrey).
     * @param _auctionId Auction to finalize
     */
    function finalizeAuction(uint256 _auctionId)
        external
        whenNotPaused
        auctionExists(_auctionId)
    {
        Auction storage auction = auctions[_auctionId];

        require(block.timestamp > auction.revealDeadline, "Reveal phase not ended");
        require(!auction.finalized, "Already finalized");

        // Effects
        auction.finalized = true;
        auction.phase = AuctionPhase.Ended;

        if (auction.winner != address(0)) {
            Commit storage winnerCommit = commits[_auctionId][auction.winner];

            // Vickrey pricing: winner pays second-highest bid
            // If only one bidder revealed, they pay their own bid
            uint256 priceToPay = auction.secondHighestBid > 0
                ? auction.secondHighestBid
                : auction.winningBid;

            // Refund winner's excess (deposit - price paid)
            uint256 winnerRefund = winnerCommit.deposit - priceToPay;
            if (winnerRefund > 0) {
                pendingWithdrawals[auction.winner] += winnerRefund;
            }

            // Send payment to auction creator
            pendingWithdrawals[auction.creator] += priceToPay;

            emit AuctionEnded(_auctionId, auction.winner, auction.winningBid, priceToPay);
        } else {
            // No valid reveals - refund all unrevealed deposits
            emit AuctionEnded(_auctionId, address(0), 0, 0);
        }

        // Refund all unrevealed bids
        address[] storage bidders = auctionBidders[_auctionId];
        for (uint256 i = 0; i < bidders.length; i++) {
            Commit storage c = commits[_auctionId][bidders[i]];
            if (!c.revealed && c.deposit > 0) {
                pendingWithdrawals[bidders[i]] += c.deposit;
                c.deposit = 0; // prevent double refund
            }
        }
    }

    // ============================================================
    //                   PULL-PAYMENT WITHDRAWAL
    // ============================================================

    /**
     * @notice Withdraw pending funds (pull-payment pattern prevents reentrancy).
     */
    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        // Effects before interactions (CEI pattern)
        pendingWithdrawals[msg.sender] = 0;

        // Interaction
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(msg.sender, amount);
    }

    // ============================================================
    //                      VIEW FUNCTIONS
    // ============================================================

    function getAuction(uint256 _auctionId) external view auctionExists(_auctionId) returns (Auction memory) {
        return auctions[_auctionId];
    }

    function getCommit(uint256 _auctionId, address _bidder) external view returns (Commit memory) {
        return commits[_auctionId][_bidder];
    }

    function getAuctionBidders(uint256 _auctionId) external view returns (address[] memory) {
        return auctionBidders[_auctionId];
    }

    function getPendingWithdrawal(address _user) external view returns (uint256) {
        return pendingWithdrawals[_user];
    }

    function getAuctionCount() external view returns (uint256) {
        return nextAuctionId;
    }

    /**
     * @notice Compute commit hash off-chain helper (also usable on-chain for verification).
     */
    function computeCommitHash(uint256 _bidAmount, bytes32 _secret) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(_bidAmount, _secret));
    }

    /**
     * @notice Returns current phase based on timestamps.
     */
    function getCurrentPhase(uint256 _auctionId) external view auctionExists(_auctionId) returns (string memory) {
        Auction storage auction = auctions[_auctionId];
        if (auction.finalized) return "Ended";
        if (block.timestamp <= auction.commitDeadline) return "Commit";
        if (block.timestamp <= auction.revealDeadline) return "Reveal";
        return "PendingFinalization";
    }

    // ============================================================
    //                     ADMIN FUNCTIONS
    // ============================================================

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }
}
