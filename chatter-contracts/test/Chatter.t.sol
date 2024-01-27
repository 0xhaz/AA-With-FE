// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Chatter} from "../src/Chatter.sol";

contract ChatterTest is Test {
    Chatter public chat;

    event Message(address indexed sender, string message);

    function setUp() public {
        chat = new Chatter();
    }

    function test_message() public {
        chat.sendMessage("Hello, World!");
        vm.expectEmit(true, false, false, true);
        emit Message(address(this), "Hello, World!");
        chat.sendMessage("Hello, World!");
    }
}
