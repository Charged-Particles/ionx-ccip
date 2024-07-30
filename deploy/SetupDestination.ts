import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { IonxCCIP, Configuration, BurnMintTokenPool } from '../typechain-types';
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

  // Load Ionx Contract
  const ionx: IonxCCIP = await ethers.getContract('IonxCCIP');
  const ionxAddress = await ionx.getAddress();
  log(` -- IONX Address: ${ionxAddress}`);

  // Set Token Pool for Configuration Contract
  await performTx(
    await config.setTokenPool(tokenPoolAddress),
    ' -- Token Pool Set for Configuration Contract!'
  );

  // Set Token Pool as Controller for IonxCCIP
  await performTx(
    await ionx.setController(tokenPoolAddress),
    ' -- Token Pool Set as Controller for IonxCCIP!'
  );

  log(`--- Destination-Chain Setup Complete! ---`);
};
export default Setup_Destination;

Setup_Destination.dependencies = ['IonxCCIP', 'Configuration', 'Bridge', 'BurnMintTokenPool'];
Setup_Destination.tags = ['SetupDestination'];
