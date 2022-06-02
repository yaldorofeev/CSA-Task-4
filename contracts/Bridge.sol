//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './MyERC20Contract.sol';
/* import "@openzeppelin/contracts/access/AccessControl.sol"; */


contract Bridge is AccessControl {

  bytes32 public constant CONTRACT_MANAGER = keccak256("CONTRACT_MANAGER");
  bytes32 public constant VALIDATOR_MANAGER = keccak256("VALIDATOR_MANAGER");


  uint256 public connectedContractCount;

  address private validator;

  //Mapping from id of token contract to its address
  mapping(uint256 => address) tokens;

  //
  mapping(bytes32 => bool) tokensByHashMinted;

  event SwapInitialized (
    uint256 tokenContractId,
    address from,
    address to,
    uint256 amount,
    uint256 nonce

  );

  event Redeem (
    uint256 tokenContractId,
    address from,
    address to,
    uint256 amount
  );

  constructor(address _validator) {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    /* myERC20Contract = MyERC20Contract(_tokenContract); */
    validator = _validator;
    connectedContractCount = 0;
  }

  function connectToken(address tokenContract) public {
    require(hasRole(CONTRACT_MANAGER, msg.sender), "Caller is not a contract manager");
    require(tokenContract != address(0),
    "Address of token contract can not be zero");
    tokens[connectedContractCount] = tokenContract;
    connectedContractCount += 1;
  }

  function changeValidator(address newValidator) public {
    require(hasRole(VALIDATOR_MANAGER, msg.sender), "Caller is not a validator manager");
    require(newValidator != address(0),
    "Address of validator can not be zero");
    validator = newValidator;
  }

  function swap(uint256 tokenContractId, address to, uint256 amount,
      uint256 nonce) public {
    require(tokens[tokenContractId] != address(0), "Ivalid ID of token contract");
    MyERC20Contract myContract = MyERC20Contract(tokens[tokenContractId]);
    myContract.burn(msg.sender, amount);
    emit SwapInitialized(tokenContractId, msg.sender , to, amount, nonce);
  }

  function redeem(uint256 tokenContractId, address from, address to, uint256 amount,
      uint256 nonce, uint8 v, bytes32 r, bytes32 s) public {
    require((msg.sender == from) || (msg.sender == to), "Onle sender or recipient can call the redeem");
    bytes32 message = keccak256(abi.encodePacked(tokenContractId, from, to, amount, nonce));
    require(ecrecover(hashMassage(message), v, r, s) == validator, "Address of validator failed check");
    MyERC20Contract myContract = MyERC20Contract(tokens[tokenContractId]);
    myContract.mint(to, amount);
    tokensByHashMinted[message] = true;
    emit Redeem(tokenContractId, from, to, amount);
  }

  function hashMassage(bytes32 message) private pure returns (bytes32) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";
    return keccak256(abi.encodePacked(prefix, message));
  }


}
