import { ethers } from "hardhat";

async function main() {
  const accounts = await ethers.getSigners();

  const Bridge= await ethers.getContractFactory("Bridge", accounts[1]);
  const bridge = await Bridge.deploy();
  await bridge.deployed();
  console.log("Bridge deployed to:", bridge.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
