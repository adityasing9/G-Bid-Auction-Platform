const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SealedBidAuction...");
  const Factory = await ethers.getContractFactory("SealedBidAuction");
  const auction = await Factory.deploy();
  await auction.waitForDeployment();
  const addr = await auction.getAddress();
  console.log("SealedBidAuction deployed to:", addr);

  const fs = require("fs");
  fs.writeFileSync("./deployment.json", JSON.stringify({
    address: addr,
    network: "localhost",
    chainId: 31337,
    timestamp: new Date().toISOString()
  }, null, 2));
  console.log("Deployment info saved.");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
