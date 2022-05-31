import { ethers } from "hardhat";

async function main() {

  const accounts = await ethers.getSigners();
  const MyERC20Contract= await ethers.getContractFactory("MyERC20Contract", accounts[0]);
  const myERC20Contract = await MyERC20Contract.deploy();

  await myERC20Contract.deployed();

  console.log("MyERC20Contract deployed to:", myERC20Contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
