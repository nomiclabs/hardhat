pragma solidity ^0.5.0;

import "./../../../../../../../../console.sol";

contract C {

	function log(
		int p3, bytes memory p15, uint p0, int p4, string memory p6, bool p9, address p12, bytes memory p16, bytes32 p18
	) public {
		console.log(console.asInt(p3), console.asHex(p15));
		console.log(console.asInt(p3), console.asHex(p15), p0);
		console.log(console.asInt(p3), console.asHex(p15), console.asInt(p4));
		console.log(console.asInt(p3), console.asHex(p15), p6);
		console.log(console.asInt(p3), console.asHex(p15), p9);
		console.log(console.asInt(p3), console.asHex(p15), p12);
		console.log(console.asInt(p3), console.asHex(p15), console.asHex(p16));
		console.log(console.asInt(p3), console.asHex(p15), console.asHex(p18));
	}
}
