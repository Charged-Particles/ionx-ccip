import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Configuration, BurnMintTokenPool } from '../typechain-types';
import { performTx } from '../utils/performTx';
import { log } from '../utils/log';

const Setup_Destination: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers } = hre;

  // DESTINATION CHAIN
  //   Setup on Destination Chain (Mode)

  // - Deploy IONX
  // - Deploy Configuration
  // - Deploy Bridge
  // - Deploy Burn & Mint Token Pool
  // - Set Token Pool for Configuration Contract

  // Load Configuration Contract
  const config: Configuration = await ethers.getContract('Configuration');
  const configAddress = await config.getAddress();
  log(` -- Configuration Address: ${configAddress}`);

  // Load BurnMintTokenPool Contract
  const tokenPool: BurnMintTokenPool = await ethers.getContract('BurnMintTokenPool');
  const tokenPoolAddress = await tokenPool.getAddress();
  log(` -- BurnMintTokenPool Address: ${tokenPoolAddress}`);

  // Set Token Pool for Configuration Contract
  await performTx(
    await config.setTokenPool(tokenPoolAddress),
    ' -- Token Pool Set for Configuration Contract!'
  );
  log(`--- Destination-Chain Setup Complete! ---`);
};
export default Setup_Destination;

Setup_Destination.dependencies = ['IonxCCIP', 'Configuration', 'Bridge', 'BurnMintTokenPool'];
Setup_Destination.tags = ['SetupDestination'];
