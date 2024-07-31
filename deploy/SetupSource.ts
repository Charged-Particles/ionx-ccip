import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Ionx, Configuration, LockReleaseTokenPool } from '../typechain-types';
import { performTx } from '../utils/performTx';
import { isTestnet } from '../utils/isTestnet';
import { log } from '../utils/log';

const Setup_Source: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, getNamedAccounts } = hre;
	const { deployer } = await getNamedAccounts();
  const isMainnet = !isTestnet();

  // SOURCE CHAIN
  //   Setup on Source Chain (Ethereum)

  // - Deploy IONX
  // - Deploy Configuration
  // - Deploy Bridge
  // - Deploy Lock & Release Token Pool
  // - Set Token Pool for Configuration Contract

  // Load Configuration Contract
  const config: Configuration = await ethers.getContract('Configuration');
  const configAddress = await config.getAddress();
  log(` -- Configuration Address: ${configAddress}`);

  // Load LockReleaseTokenPool Contract
  const tokenPool: LockReleaseTokenPool = await ethers.getContract('LockReleaseTokenPool');
  const tokenPoolAddress = await tokenPool.getAddress();
  log(` -- LockReleaseTokenPool Address: ${tokenPoolAddress}`);

  // Set Ionx Minter
  if (!isMainnet) {
    // Load Ionx Contract
    const ionx: Ionx = await ethers.getContract('Ionx');
    const ionxAddress = await ionx.getAddress();
    log(` -- IONX Address: ${ionxAddress}`);

    await performTx(
      await ionx.setMinter(deployer),
      ' -- Minter Set for Ionx Contract!'
    );
  }

  // Set Token Pool for Configuration Contract
  await performTx(
    await config.setTokenPool(tokenPoolAddress),
    ' -- Token Pool Set for Configuration Contract!'
  );

  log(`--- Source-Chain Setup Complete! ---`);
};
export default Setup_Source;

Setup_Source.dependencies = ['Ionx', 'Configuration', 'Bridge', 'LockReleaseTokenPool'];
Setup_Source.tags = ['SetupSource'];
