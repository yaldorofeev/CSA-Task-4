import 'dotenv/config';
import { types } from "hardhat/config";
import { task } from "hardhat/config";

task("swap", "Swap tokens")
  .addParam("user", "ID of accaunt in array in .env")
  .addParam("net", "Blockchain name (eth or bsc)")
  .addParam("amount", "The amount of tokens")
  .setAction(async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  let bridge_addr;
  let erc20_addr;

  if (args.net == "eth") {
    bridge_addr = process.env.BRIDGE_CONTRACT_ETH!;
    erc20_addr = process.env.ERC20_CONTRACT_ETH!;
  }
  else if (args.net == "bsc") {
    bridge_addr = process.env.BRIDGE_CONTRACT_BSC!;
    erc20_addr = process.env.ERC20_CONTRACT_BSC!;
  }
  else {
    console.log("Incorrect name of blockchain");
    return;
  }

  const contract = await hre.ethers.getContractAt("Bridge",
  process.env.bridge_addr, accounts[args.user]);

  const tx = await contract.approve(args.spender, args.tokenid);

  // tx.wait();
  // console.log(tx);
});
