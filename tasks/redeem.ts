import 'dotenv/config';
import { types } from "hardhat/config";
import { task } from "hardhat/config";
import * as fs from 'fs';


task("redeem", "Redeem tokens")
  .addParam("user", "ID of accaunt in array in .env")
  .addParam("chainto", "Blockchain name (eth or bsc)")
  .addParam("nonce", "ID of transaction")
  .setAction(async (args, hre) => {

  let bridge_addr;
  let erc20_addr;
  let chainId;

  if (args.chainto == "eth") {
    bridge_addr = process.env.BRIDGE_CONTRACT_ETH!;
    erc20_addr = process.env.ERC20_CONTRACT_ETH!;
    hre.changeNetwork('rinkeby');
  }
  else if (args.chainto == "bsc") {
    bridge_addr = process.env.BRIDGE_CONTRACT_BSC!;
    erc20_addr = process.env.ERC20_CONTRACT_BSC!;
    hre.changeNetwork('bsc_testnet');
  }
  else {
    console.log("Incorrect name of blockchain");
    return;
  }

  const accounts = await hre.ethers.getSigners();

  let data = await fs.readFileSync("message.json");
  const message = JSON.parse(data.toString());
  let msg = hre.ethers.utils.solidityKeccak256(
    ["uint256", "uint256", "address", "address", "uint256", "uint256"],
    [message.chainId, message.tokenContractId, message.from,
      message.to, message.amount, message.nonce]
  );
  let owner = accounts[0];
  let signature = await owner.signMessage(hre.ethers.utils.arrayify(msg));
  let sig = await hre.ethers.utils.splitSignature(signature);

  const contractB = await hre.ethers.getContractAt("Bridge",
  bridge_addr, accounts[args.user]);
  const tx = contractB.redeem(message.chainId, message.tcid, message.from,
    message.to, message.amount, message.nonce, sig.v, sig.r, sig.s);
  const txx = await tx.wait();
  console.log(txx);
  // tx.wait();

});
