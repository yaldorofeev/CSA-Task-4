//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './MyERC20Contract.sol';

contract Bridge {

  MyERC20Contract myERC20Contract;

  event Swap (
    address sender
  );

  event Redeem (
    address reciever
  );

  event Checked (
    address reciever
  );

  constructor(address _tokenContract) {
    require(address(_tokenContract) != address(0),
    "Address of token contract can not be zero");
    myERC20Contract = MyERC20Contract(_tokenContract);
  }

  function swap(uint256 _amount) public {
    myERC20Contract.burn(msg.sender, _amount);
    emit Swap(msg.sender);

  }

  function redeem(uint256 _amount) public {
    myERC20Contract.mint(msg.sender, _amount);
    emit Redeem(msg.sender);
  }

  function checkSign(address addr, bytes32 hash, uint8 v, bytes32 r, bytes32 s)
    public pure returns (address signer) {
    bytes32 messageDigest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    require(ecrecover(messageDigest, v, r, s) == addr, "Address failed check");
    return addr;
    /* emit Checked(addr); */
  }


}
