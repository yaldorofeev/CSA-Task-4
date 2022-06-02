import 'dotenv/config';
import { types } from "hardhat/config";
import { task } from "hardhat/config";
import "hardhat-change-network";

task("swap", "Swap tokens")
  .addParam("user", "ID of accaunt in array in .env")
  .addParam("net", "Blockchain name (eth or bsc)")
  .addParam("tcid", "ID of token contract")
  .addParam("to", "Recipient of tokens")
  .addParam("amount", "The amount of tokens")
  .setAction(async (args, hre) => {

  let bridge_addr;
  let erc20_addr;

  if (args.net == "eth") {
    bridge_addr = process.env.BRIDGE_CONTRACT_ETH!;
    erc20_addr = process.env.ERC20_CONTRACT_ETH!;
    hre.changeNetwork('rinkeby');
  }
  else if (args.net == "bsc") {
    bridge_addr = process.env.BRIDGE_CONTRACT_BSC!;
    erc20_addr = process.env.ERC20_CONTRACT_BSC!;
    hre.changeNetwork('bsc_testnet');
  }
  else {
    console.log("Incorrect name of blockchain");
    return;
  }

  const accounts = await hre.ethers.getSigners();

  const contractB = await hre.ethers.getContractAt("Bridge",
  bridge_addr, accounts[args.user]);

  const contractT = await hre.ethers.getContractAt("MyERC20Contract",
  erc20_addr, accounts[args.user]);
  const tx = await contractT.approve(args.spender, args.tokenid);

  // tx.wait();
  // console.log(tx);
});
