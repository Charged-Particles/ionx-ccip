// SPDX-License-Identifier: MIT

// IonxCCIP.sol -- Part of the Charged Particles Protocol
// Copyright (c) 2024 Firma Lux, Inc. <https://charged.fi>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

pragma solidity 0.8.24;

import {IBurnMintERC20} from "./interfaces/IBurnMintERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BlackholePrevention} from "./lib/BlackholePrevention.sol";

contract IonxCCIP is IBurnMintERC20, ERC20, Ownable, BlackholePrevention {
  /// @notice An event thats emitted when the controller address is changed
  event ControllerChanged(address newController);

  /// @notice Address which may mint new tokens
  address public controller;

  constructor() ERC20("Charged Particles - IONX", "IONX") Ownable(msg.sender) {}

  /**
    * @notice Returns the number of decimal-places for the Token
    */
  function decimals() public pure override returns (uint8) {
    return 18;
  }

  /**
    * @notice Change the controller address (the controller may mint/burn tokens)
    * @param newController The address of the new controller
    */
  function setController(address newController) external onlyOwner {
    controller = newController;
    emit ControllerChanged(newController);
  }

  /**
    * @notice Mint new tokens
    * @param to The address of the destination account
    * @param amount The number of tokens to be minted
    */
  function mint(address to, uint256 amount) external onlyController {
    _mint(to, amount);
  }

  /**
    * @notice Burn old tokens
    * @param amount The number of tokens to be burned
    */
  function burn(uint256 amount) external onlyController {
    _burn(msg.sender, amount);
  }

  /// @notice This contract should never hold ETH, if any is accidentally sent in then the DAO can return it
  function withdrawEther(address payable receiver, uint256 amount) external onlyOwner {
    _withdrawEther(receiver, amount);
  }

  /// @notice This contract should never hold any tokens, if any are accidentally sent in then the DAO can return them
  function withdrawErc20(address payable receiver, address tokenAddress, uint256 amount) external onlyOwner {
    _withdrawERC20(receiver, tokenAddress, amount);
  }

  /// @notice This contract should never hold any tokens, if any are accidentally sent in then the DAO can return them
  function withdrawERC721(address payable receiver, address tokenAddress, uint256 tokenId) external onlyOwner {
    _withdrawERC721(receiver, tokenAddress, tokenId);
  }

  modifier onlyController() {
    require(msg.sender == controller, "Ionx:E-113");
    _;
  }
}
