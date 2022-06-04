import 'dotenv/config';
import { types } from "hardhat/config";
import { task } from "hardhat/config";

task("connecterc", "Connect erc token contract")
  .addParam("user", "ID of accaunt in array in .env")
  .addParam("chain", "Blockchain name (eth or bsc)")
  .addParam("erccontract", "Address of token contract")
  .setAction(async (args, hre) => {

  let bridge_addr;
  let erc20_addr;
  let chainId;

  if (args.chain == "eth") {
    bridge_addr = process.env.BRIDGE_CONTRACT_ETH!;
    hre.changeNetwork('rinkeby');
  }
  else if (args.chain == "bsc") {
    bridge_addr = process.env.BRIDGE_CONTRACT_BSC!;
    hre.changeNetwork('bsc_testnet');
  }
  else {
    console.log("Incorrect name of blockchain");
    return;
  }

  const accounts = await hre.ethers.getSigners();

  const contractB = await hre.ethers.getContractAt("Bridge",
  bridge_addr, accounts[1]);

  await contractB.grantRole(contractB.CONTRACT_MANAGER(),
    await accounts[args.user].getAddress());

  await contractB.connectToken(args.erccontract);

});
