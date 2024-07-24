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
  let deployerBalance = await ionx.balanceOf(deployer);
  if (deployerBalance === 0n) {
    await performTx(await ionx.mint(deployer, parseEther('1000000')), ` -- Tokens Minted to Deployer!`);
    deployerBalance = await ionx.balanceOf(deployer);
  }
  log(` -- Deployer Balance: ${formatEther(deployerBalance)} IONX`);


  // Prefund the Sender Account
  let balanceBefore = await ionx.balanceOf(user1);
  if (balanceBefore < parseEther('1')) {
    await performTx(await ionx.transfer(user1, parseEther('1000')), ` -- Tokens Sent to User1!`);
    balanceBefore = await ionx.balanceOf(user1);
  }
  log(` -- User1 Balance Before: ${formatEther(balanceBefore)} IONX`);

  // Get Bridge Fees
  const bridgeFees = await bridge.getFee(
    deployConfigOpp.chainSelector,
    ionxAddress,
    parseEther('100'),
    user1,
    ethers.ZeroAddress
  );
  log(` -- Bridge Fees: ${formatEther(bridgeFees)} ETH`);

  // Get Gas Fees for Approve
  const approvalFees = await ionx.approve.estimateGas(bridgeAddress, parseEther('100'));
  log(` -- Approval Fees: ${formatEther(approvalFees)} ETH`);

  //  Pre-fund User1
  const extraFees = (((bridgeFees + approvalFees) * 100n) / 20n) / 100n;
  const totalFees = (bridgeFees + approvalFees + extraFees);
  log(` -- Total Fees: ${formatEther(totalFees)} ETH`);

  const tx = await deployerS.sendTransaction({ to: user1, value: totalFees })
  await tx.wait();
  log(` -- Pre-funded User1 with Gas Fees`);


  // Approve Bridge Transfer
  await performTx(await ionx.connect(signer1).approve(bridgeAddress, parseEther('100')), ` -- Tokens Approved for Bridge!`);

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

  log(`View TX on Source Chain: https://sepolia.etherscan.io/tx/${txHash}`);
  log(`View User on Source Chain: https://sepolia.etherscan.io/address/${user1}`);
  log(`View User on Destination Chain: https://sepolia.explorer.mode.network/address/${user1}`);
};
export default Test_Connection;

Test_Connection.tags = ['TestConnection'];
