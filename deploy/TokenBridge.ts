import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Bridge } from '../typechain-types';
import { performTx } from '../utils/performTx';
import { getDeployConfig } from '../utils/config';
import { isSourceChain } from '../utils/isSourceChain';
import { isTestnet } from '../utils/isTestnet';
import { log } from '../utils/log';
import _ from 'lodash';

const TokenBridge: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, getNamedAccounts } = hre;
  const { formatEther, parseEther } = ethers;
	const { deployer } = await getNamedAccounts();
  const deployerS = await ethers.getSigner(deployer);
  const isMainnet = !isTestnet();

  const AMOUNT_TO_SEND = parseEther('10'); // IONX Tokens

  log(`--- Executing Token Bridge from ${isSourceChain() ? 'Source' : 'Destination'} Chain ---`);
  log(` -- Deployer Address: ${deployer}`);
  log(` -- Receiver Address: ${deployer}`);

  const deployConfigOpp = getDeployConfig({ oppositeChain: true });

  // Load Ionx Contract
  let ionx: any;
  if (isSourceChain()) {
    if (isMainnet) {
      ionx = await ethers.getContractAt('Ionx', '0x02D3A27Ac3f55d5D91Fb0f52759842696a864217');
    } else {
      ionx = await ethers.getContract('Ionx');
    }
  } else {
    ionx = await ethers.getContract('IonxCCIP');
  }
  const ionxAddress = await ionx.getAddress();
  log(` -- IONX Address: ${ionxAddress}`);

  // Load Bridge Contract
  const bridge: Bridge = await ethers.getContract('Bridge');
  const bridgeAddress = await bridge.getAddress();
  log(` -- Bridge Address: ${bridgeAddress}`);

  // Get Bridge Fees
  const bridgeFees = await bridge.getFee(
    deployConfigOpp.chainSelector,
    ionxAddress,
    AMOUNT_TO_SEND,
    deployer,
    ethers.ZeroAddress // Fee Token (Native)
  );
  log(` -- Estimated Bridge Fees: ${formatEther(bridgeFees)} ETH`);

  const extraBridgeFees = ((bridgeFees * 100n) / 10n) / 100n;  //  to cover any fee-discrepencies
  const finalBridgeFees = (bridgeFees + extraBridgeFees);
  log(` -- Final Bridge Fees: ${formatEther(finalBridgeFees)} ETH`);

  const deployerBalance = await ethers.provider.getBalance(deployer);
  log(` -- Deployer Balance: ${formatEther(deployerBalance)} ETH`);
  if (deployerBalance < finalBridgeFees) {
    log(` -- Sender does not have enough ETH for Fees! Exiting...`);
    return;
  }

  // Approve Bridge Transfer
  const allowance = await ionx.allowance(deployer, bridgeAddress);
  if (allowance < parseEther('100')) {
    await performTx(await ionx.connect(deployerS).approve(bridgeAddress, AMOUNT_TO_SEND), ` -- Tokens Approved for Bridge!`);
  } else {
    log(` -- Tokens Pre-Approved for Bridge!`);
  }

  // Test Bridging!
  const txHash = await performTx(
    await bridge.connect(deployerS).transferTokensToDestinationChain(
      deployConfigOpp.chainSelector,
      ionxAddress,
      AMOUNT_TO_SEND,
      deployer,
      ethers.ZeroAddress,
      {value: finalBridgeFees}
    ),
    ` -- Tokens Transferred to ${isSourceChain() ? 'Destination' : 'Source'} Chain!`
  );

  // Check Balance of User1
  const balanceAfter = await ionx.balanceOf(deployer);
  log(` -- Balance After: ${formatEther(balanceAfter)} IONX`);

  log(`--- ${isSourceChain() ? 'Source' : 'Destination'} Chain Token Bridge Complete! ---`);

  log(`View TX on CCIP Explorer: https://ccip.chain.link/tx/${txHash}`);
  if (isSourceChain()) {
    log(`View TX on Eth-Sepolia: https://sepolia.etherscan.io/tx/${txHash}`);
  } else {
    log(`View TX on Mode-Sepolia: https://sepolia.explorer.mode.network/tx/${txHash}`);
  }
  log(`View User on Eth-Sepolia: https://sepolia.etherscan.io/address/${deployer}`);
  log(`View User on Mode-Sepolia Chain: https://sepolia.explorer.mode.network/address/${deployer}`);
};
export default TokenBridge;

TokenBridge.tags = ['TokenBridge'];
