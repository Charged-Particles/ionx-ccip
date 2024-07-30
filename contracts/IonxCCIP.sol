// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;


import {IBurnMintERC20} from "./interfaces/IBurnMintERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract IonxCCIP is IBurnMintERC20, ERC20, Ownable {
  event ControllerChanged(address newController);

  address public controller;

  constructor() ERC20("Charged Particles - IONX", "IONX") Ownable(msg.sender) {}

  function decimals() public pure override returns (uint8) {
    return 18;
  }

  function setController(address newController) external onlyOwner {
    controller = newController;
    emit ControllerChanged(newController);
  }

  function mint(address to, uint256 amount) external onlyController {
    _mint(to, amount);
  }

  function burn(uint256 amount) external onlyController {
    _burn(msg.sender, amount);
  }

  modifier onlyController() {
    require(msg.sender == controller, "Ionx:E-113");
    _;
  }
}
