pragma solidity ^0.8.0;

import "./d.sol";

contract C {

  function test() payable public {
    D d = new D();
    payable(address(d)).send(1);

    revert("failed here");
  }

}
