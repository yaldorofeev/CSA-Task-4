import 'dotenv/config';
import { types } from "hardhat/config";
import { task } from "hardhat/config";
import * as fs from 'fs';


task("swap", "Swap tokens")
  .addParam("user", "ID of accaunt in array in .env")
  .addParam("chainto", "Blockchain name (eth or bsc)")
  .addParam("tcid", "ID of token contract")
  .addParam("to", "Recipient of tokens")
  .addParam("amount", "The amount of tokens")
  .setAction(async (args, hre) => {

  let bridge_addr;
  let erc20_addr;
  let chainId;

  if (args.net == "eth") {
    bridge_addr = process.env.BRIDGE_CONTRACT_ETH!;
    // erc20_addr = process.env.ERC20_CONTRACT_ETH!;
    hre.changeNetwork('rinkeby');
  }
  else if (args.net == "bsc") {
    bridge_addr = process.env.BRIDGE_CONTRACT_BSC!;
    // erc20_addr = process.env.ERC20_CONTRACT_BSC!;
    hre.changeNetwork('bsc_testnet');
  }
  else {
    console.log("Incorrect name of blockchain");
    return;
  }

  if (args.chainto == "eth") {
    chainId = 1;
  }
  else if (args.chainfrom == "bsc") {
    chainId = 2;
  }
  else {
    console.log("Incorrect name of blockchain");
    return;
  }

  const accounts = await hre.ethers.getSigners();

  const nonce = Math.floor(Math.random() * 10000);
  // var array = new Uint32Array(1000);
  // window.crypto.getRandomValues(array);
  // const nonce = array[r_unit];

  const contractB = await hre.ethers.getContractAt("Bridge",
  bridge_addr, accounts[args.user]);

  const tx = contractB.swap(chainId, args.tcid, args.to, args.amount, nonce);
  const txx = await tx.wait();

  const message = {
    chainId: txx.events[2].args["chainId"].toNumber(),
    tokenContractId: txx.events[2].args["tokenContractId"].toNumber(),
    from: txx.events[2].args["from"],
    to: txx.events[2].args["to"],
    amount: txx.events[2].args["amount"].toNumber(),
    nonce: txx.events[2].args["nonce"].toNumber()
  };
  const nonce_ = txx.events[2].args["nonce"].toNumber()
  console.log(message);
  const data = JSON.stringify(message);

  fs.writeFileSync("message${nonce_}.json", data);

});
