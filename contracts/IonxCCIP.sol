// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;


import {IBurnMintERC20} from "./interfaces/IBurnMintERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract IonxCCIP is IBurnMintERC20, ERC20 {
  constructor() ERC20("Charged Particles - IONX", "IONX") {}

  function decimals() public pure override returns (uint8) {
    return 18;
  }

  function mint(address to, uint256 amount) external {
    _mint(to, amount);
  }

  function burn(uint256 amount) external {
    _burn(msg.sender, amount);
  }
}
