// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IBurnMintERC20} from "../interfaces/IBurnMintERC20.sol";
import {Pool} from "./Pool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract BurnMintTokenPool is Pool {
    constructor(
        IERC20 token,
        address bridge
    ) Pool(token, TokenPoolType.BurnMint, bridge) {}

    function _lockOrBurn(uint256 amount) internal override {
        IBurnMintERC20(address(i_token)).burn(amount);
        emit Burned(msg.sender, amount);
    }

    function _releaseOrMint(
        uint256 amount,
        address receiver
    ) internal override {
        IBurnMintERC20(address(i_token)).mint(receiver, amount);
        emit Minted(msg.sender, receiver, amount);
    }
}
