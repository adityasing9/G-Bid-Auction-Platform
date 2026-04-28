export const CONTRACT_ADDRESS = "0xf197C5DCae3b2913700042A381B54c0E32266214";
export const CONTRACT_ABI = [
  "function createAuction(string _title, string _description, string _assetType, uint256 _minBid, uint256 _commitDuration, uint256 _revealDuration, uint256 _antiSnipeSeconds) external returns (uint256)",
  "function commitBid(uint256 _auctionId, bytes32 _commitHash) external payable",
  "function revealBid(uint256 _auctionId, uint256 _bidAmount, bytes32 _secret) external",
  "function finalizeAuction(uint256 _auctionId) external",
  "function withdraw() external",
  "function getAuction(uint256 _auctionId) external view returns (tuple(uint256 id, address creator, string title, string description, string assetType, uint256 minBid, uint256 commitDeadline, uint256 revealDeadline, uint256 antiSnipeExtension, uint8 phase, address winner, uint256 winningBid, uint256 secondHighestBid, uint256 totalCommits, uint256 totalReveals, bool finalized))",
  "function getPendingWithdrawal(address _user) external view returns (uint256)",
  "event AuctionCreated(uint256 indexed auctionId, address indexed creator, string title, string assetType, uint256 minBid, uint256 commitDeadline, uint256 revealDeadline)",
  "event BidCommitted(uint256 indexed auctionId, address indexed bidder, bytes32 commitHash, uint256 deposit)",
  "event BidRevealed(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 winningBid, uint256 pricePaid)"
];
