import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Ionx, Bridge } from '../typechain-types';
import { performTx } from '../utils/performTx';
import { getDeployConfig } from '../utils/config';
import { isSourceChain } from '../utils/isSourceChain';
import { log } from '../utils/log';
import _ from 'lodash';

const Test_Connection: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, getNamedAccounts } = hre;
  const { formatEther, parseEther } = ethers;
	const { deployer, user1 } = await getNamedAccounts();
  const deployerS = await ethers.getSigner(deployer);
  const signer1 = await ethers.getSigner(user1);

  log(`--- Testing Bridge from ${isSourceChain() ? 'Source' : 'Destination'} Chain ---`);
  log(` -- Deployer Address: ${deployer}`);
  log(` -- User1 Address: ${user1}`);

  const deployConfigOpp = getDeployConfig({ oppositeChain: true });

  // Load Ionx Contract
  let ionx: any;
  if (isSourceChain()) {
    ionx = await ethers.getContract('Ionx');
  } else {
    ionx = await ethers.getContract('IonxCCIP');
  }
  const ionxAddress = await ionx.getAddress();
  log(` -- IONX Address: ${ionxAddress}`);

  // Load Bridge Contract
  const bridge: Bridge = await ethers.getContract('Bridge');
  const bridgeAddress = await bridge.getAddress();
  log(` -- Bridge Address: ${bridgeAddress}`);

  // Mint to Deployer Account
  if (isSourceChain()) {
    let deployerBalance = await ionx.balanceOf(deployer);
    if (deployerBalance === 0n) {
      await performTx(await ionx.mint(deployer, parseEther('1000000')), ` -- Tokens Minted to Deployer!`);
      deployerBalance = await ionx.balanceOf(deployer);
    }
    log(` -- Deployer Balance: ${formatEther(deployerBalance)} IONX`);
  }

  // Prefund the Sender Account on Source Chain only
  //  (when Sending back, user1 should have IONX already, but may need ETH for gas fees)
  let balanceBefore = await ionx.balanceOf(user1);
  if (isSourceChain()) {
    if (balanceBefore < parseEther('1')) {
      await performTx(await ionx.transfer(user1, parseEther('1000')), ` -- Tokens Sent to User1!`);
      balanceBefore = await ionx.balanceOf(user1);
    }
  }
  log(` -- User1 Balance Before: ${formatEther(balanceBefore)} IONX`);

  // Get Bridge Fees
  const bridgeFees = await bridge.getFee(
    deployConfigOpp.chainSelector,
    ionxAddress,
    parseEther('100'),
    user1,
    ethers.ZeroAddress // Fee Token (Native)
  );
  log(` -- Bridge Fees: ${formatEther(bridgeFees)} ETH`);

  let user1Balance = await ethers.provider.getBalance(user1);
  if (user1Balance < parseEther('0.2')) {
    const tx = await deployerS.sendTransaction({ to: user1, value: parseEther('0.2') })
    await tx.wait(3);
    user1Balance = await ethers.provider.getBalance(user1);
    log(` -- Pre-funding User1 with Gas Fees`);
  }
  log(` -- User1 Balance: ${formatEther(user1Balance)} ETH`);

  // Approve Bridge Transfer
  const allowance = await ionx.allowance(user1, bridgeAddress);
  if (allowance < parseEther('100')) {
    await performTx(await ionx.connect(signer1).approve(bridgeAddress, parseEther('100')), ` -- Tokens Approved for Bridge!`);
  } else {
    log(` -- Tokens Pre-Approved for Bridge!`);
  }

  // Test Bridging!
  const txHash = await performTx(
    await bridge.connect(signer1).transferTokensToDestinationChain(
      deployConfigOpp.chainSelector,
      ionxAddress,
      parseEther('100'),
      user1,
      ethers.ZeroAddress,
      {value: bridgeFees}
    ),
    ` -- Tokens Transferred to ${isSourceChain() ? 'Destination' : 'Source'} Chain!`
  );

  // Check Balance of User1
  const balanceAfter = await ionx.balanceOf(user1);
  log(` -- Balance After: ${formatEther(balanceAfter)} IONX`);

  log(`--- ${isSourceChain() ? 'Source' : 'Destination'} Chain Bridge Testing Complete! ---`);

  log(`View TX on CCIP Explorer: https://ccip.chain.link/tx/${txHash}`);
  if (isSourceChain()) {
    log(`View TX on Eth-Sepolia: https://sepolia.etherscan.io/tx/${txHash}`);
  } else {
    log(`View TX on Mode-Sepolia: https://sepolia.explorer.mode.network/tx/${txHash}`);
  }
  log(`View User on Eth-Sepolia: https://sepolia.etherscan.io/address/${user1}`);
  log(`View User on Mode-Sepolia Chain: https://sepolia.explorer.mode.network/address/${user1}`);
};
export default Test_Connection;

Test_Connection.tags = ['TestConnection'];
