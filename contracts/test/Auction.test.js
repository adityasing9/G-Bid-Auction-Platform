const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SealedBidAuction", function () {
  let auction;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SealedBidAuction");
    auction = await Factory.deploy();
  });

  it("Should create an auction correctly", async function () {
    await auction.createAuction(
      "Test Auction",
      "Desc",
      "Art",
      ethers.parseEther("0.1"),
      300,
      300,
      60
    );
    const details = await auction.getAuction(0);
    expect(details.title).to.equal("Test Auction");
    expect(details.minBid).to.equal(ethers.parseEther("0.1"));
  });

  it("Should handle commit and reveal", async function () {
    const bidAmount = ethers.parseEther("0.5");
    const secret = ethers.keccak256(ethers.toUtf8Bytes("secret"));
    const hash = ethers.solidityPackedKeccak256(["uint256", "bytes32"], [bidAmount, secret]);

    await auction.createAuction("T", "D", "A", ethers.parseEther("0.1"), 300, 300, 0);
    
    // Commit
    await auction.connect(addr1).commitBid(0, hash, { value: bidAmount });
    let commit = await auction.getCommit(0, addr1.address);
    expect(commit.hash).to.equal(hash);

    // Fast forward time to reveal phase
    await network.provider.send("evm_increaseTime", [301]);
    await network.provider.send("evm_mine");

    // Reveal
    await auction.connect(addr1).revealBid(0, bidAmount, secret);
    commit = await auction.getCommit(0, addr1.address);
    expect(commit.revealed).to.be.true;
    expect(commit.revealedAmount).to.equal(bidAmount);
  });
});
