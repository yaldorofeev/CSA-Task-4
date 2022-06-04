import { expect } from "chai";
import { ethers, network } from "hardhat";
import { Signer, Contract } from "ethers";
import * as dotenv from "dotenv";
import { types } from "hardhat/config";

describe("Bridge", function () {
  //We will test contract in hardhat network without forking, so we should
  //deploy token contract too, and to

  let myBridgeETH: Contract;
  let myBridgeBSC: Contract;
  let erc20ContractETH: Contract;
  let erc20ContractBSC: Contract;

  let accounts: Signer[];

  let chainIdETH = 1;
  let chainIdBSC = 2;

  let tokenContractId = 0;

  let main_owner: Signer;
  let validator: Signer;
  let user_1: Signer;
  let user_2: Signer;
  let newValidator: Signer;
  let contract_manager: Signer;
  let user_3: Signer;
  let validator_manager: Signer;

  let sigV = 0;
  let sigR = "0";
  let sigS = "0";

  let amount = ethers.BigNumber.from('10000000');

  it("Deploy ERC20 contract and mint tokens to user_1 in Etherium",
      async function () {
    accounts = await ethers.getSigners();
    main_owner = accounts[0];
    validator = accounts[1];
    user_1 = accounts[2];
    user_2 = accounts[3];
    newValidator = accounts[4];
    contract_manager = accounts[5];
    user_3 = accounts[6];
    validator_manager = accounts[7];

    const MyERC20Contract = await ethers.getContractFactory("MyERC20Contract",
      main_owner);

    erc20ContractETH = await MyERC20Contract.deploy();

    await erc20ContractETH.deployed();

    await erc20ContractETH.grantRole(erc20ContractETH.MINTER_BURNER(),
      await main_owner.getAddress())

    await erc20ContractETH.mint(await user_1.getAddress(), amount);
  });

  it("Deploy Bridge contract, set token manager role and connect token contract in Etherium",
      async function () {

    const Bridge = await ethers.getContractFactory("Bridge",
      main_owner);

    myBridgeETH = await Bridge.deploy(await validator.getAddress(), chainIdETH);

    await myBridgeETH.deployed();

    await expect(myBridgeETH.connect(contract_manager)
      .connectToken(erc20ContractETH.address))
      .to.be.revertedWith("Caller is not a contract manager");

    await myBridgeETH.grantRole(myBridgeETH.CONTRACT_MANAGER(),
      await contract_manager.getAddress());

    await expect(myBridgeETH.connect(contract_manager)
      .connectToken(ethers.constants.AddressZero))
      .to.be.revertedWith("Address of token contract can not be zero");

    await myBridgeETH.connect(contract_manager)
      .connectToken(erc20ContractETH.address);
  });

  it("Set role MINTER_BURNER of ERC contract", async function () {

    await expect(erc20ContractETH.grantRole(erc20ContractETH.MINTER_BURNER(),
      myBridgeETH.address))
      .to.emit(erc20ContractETH, "RoleGranted")
      .withArgs(await erc20ContractETH.MINTER_BURNER(), myBridgeETH.address,
      await main_owner.getAddress());
  });

  it("Test swap by user_1 in Etherium", async function () {
    //backend generate nonce
    const nonce = 300;

    await expect(myBridgeETH.connect(user_1)
      .swap(chainIdBSC, 5, await user_2.getAddress(),
        amount, nonce))
      .to.be.revertedWith("Ivalid ID of token contract");

    await expect(myBridgeETH.connect(user_1)
      .swap(chainIdBSC, tokenContractId, await user_2.getAddress(),
        amount, nonce))
      .to.emit(myBridgeETH, "SwapInitialized")
      .withArgs(chainIdBSC, tokenContractId, await user_1.getAddress(), await user_2.getAddress(),
        amount, nonce);
  });

  it("Backend sign massege", async function () {
    const nonce = 300;

    let msg = ethers.utils.solidityKeccak256(
      ["uint256", "uint256", "address", "address", "uint256", "uint256"],
      [chainIdBSC, tokenContractId, await user_1.getAddress(), await user_2.getAddress(), amount, nonce]
    );

    let signature = await validator.signMessage(ethers.utils.arrayify(msg));

    let sig = await ethers.utils.splitSignature(signature);
    sigV = sig.v;
    sigR = sig.r;
    sigS = sig.s;
  });

  it("Set contracts in 'Binance'", async function () {
    const MyERC20Contract = await ethers.getContractFactory("MyERC20Contract",
      main_owner);

    erc20ContractBSC = await MyERC20Contract.deploy();

    await erc20ContractBSC.deployed();

    const Bridge = await ethers.getContractFactory("Bridge",
      main_owner);

    myBridgeBSC = await Bridge.deploy(await validator.getAddress(), chainIdBSC);

    await myBridgeBSC.deployed();

    await myBridgeBSC.grantRole(myBridgeBSC.CONTRACT_MANAGER(),
      await contract_manager.getAddress());

    await myBridgeBSC.connect(contract_manager)
      .connectToken(erc20ContractBSC.address);

    await erc20ContractBSC.grantRole(erc20ContractBSC.MINTER_BURNER(),
        myBridgeBSC.address)
  });

  it("Revert of redeem in te same net", async function () {
    const nonce = 300;

    await expect(myBridgeETH.connect(user_1)
      .redeem(chainIdBSC, tokenContractId, await user_1.getAddress(),
        await user_2.getAddress(), amount, nonce, sigV, sigR, sigS))
      .to.be.revertedWith("Invalid blockchain");
  });

  it("Reverts of redeem because invalid sender", async function () {
    const nonce = 300;

    await expect(myBridgeBSC.connect(user_3)
      .redeem(chainIdBSC, tokenContractId, await user_1.getAddress(),
        await user_2.getAddress(), amount, nonce, sigV, sigR, sigS))
      .to.be.revertedWith("Onle sender or recipient can call the redeem");
  });

  it("Reverts of redeem because invalid message", async function () {
    const nonce = 300;

    await expect(myBridgeBSC.connect(user_2)
      .redeem(chainIdBSC, tokenContractId, await user_1.getAddress(),
        await user_2.getAddress(), ethers.BigNumber.from('20000000'), nonce, sigV, sigR, sigS))
      .to.be.revertedWith("Address of validator failed check");
  });


  it("Redeem by user_2 in Binance", async function () {
    const nonce = 300;

    await expect(myBridgeBSC.connect(user_1)
      .redeem(chainIdBSC, tokenContractId, await user_1.getAddress(),
        await user_2.getAddress(), amount, nonce, sigV, sigR, sigS))
      .to.emit(myBridgeBSC, "Redeem")
      .withArgs(tokenContractId, await user_1.getAddress(),
        await user_2.getAddress(), amount);
  });

  it("Reverts of redeem because second call", async function () {
    const nonce = 300;

    await expect(myBridgeBSC.connect(user_2)
      .redeem(chainIdBSC, tokenContractId, await user_1.getAddress(),
        await user_2.getAddress(), amount, nonce, sigV, sigR, sigS))
      .to.be.revertedWith("This transfer already done");
  });

  it("Test validator change in Etherium", async function () {

    await expect(myBridgeETH.connect(validator_manager)
      .changeValidator(await newValidator.getAddress()))
      .to.be.revertedWith("Caller is not a validator manager");

    await myBridgeETH.grantRole(myBridgeETH.VALIDATOR_MANAGER(),
      await validator_manager.getAddress());

    await expect(myBridgeETH.connect(validator_manager)
      .changeValidator(ethers.constants.AddressZero))
      .to.be.revertedWith("Address of validator can not be zero");

    await myBridgeETH.connect(validator_manager)
      .changeValidator(await validator_manager.getAddress());
  });

});
