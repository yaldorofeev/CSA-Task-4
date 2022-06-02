import { ethers } from "hardhat";

async function main() {
  let msg = ethers.utils.solidityKeccak256(
    ["uint256", "address", "address", "uint256", "uint256"],
    [addr, value]
  )

  // let signature = await owner.signMassege(ethers.utils.arrayfy(msg));
  // let sig = await ethers.utils.splitSignature(signature);
  //
  // await contract.checkSign(addr, val, sig.v, sig.r, sig.s);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
