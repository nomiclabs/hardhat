pragma solidity ^0.8.0;


contract D {
  struct MyStruct {
    uint x;
    uint y;
  }

  function fail() public returns (MyStruct[] memory)
  {
    revert("D failed");

    MyStruct[] memory structs = new MyStruct[](2);
    structs[0] = MyStruct(1, 2);
    structs[1] = MyStruct(2, 3);

    return structs;
  }
}
