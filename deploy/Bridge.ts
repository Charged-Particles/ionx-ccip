import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verifyContract';
import { Configuration } from '../typechain-types';
import { getDeployConfig } from '../utils/config';
import { isHardhat } from '../utils/isHardhat';
import { log } from '../utils/log';

const Bridge_Deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

  const deployConfig = getDeployConfig();
  log(` -- Deploy Configuration: {router: "${deployConfig.router}", chainSelector: ${deployConfig.chainSelector} }`);

  // Load Configuration Contract
  const config: Configuration = await ethers.getContract('Configuration');
  const configAddress = await config.getAddress();
  log(` -- Configuration Address: ${configAddress}`);

  // Deploy
  const constructorArgs:any = [ deployConfig.router, configAddress ];
	await deploy('Bridge', {
		from: deployer,
		args: constructorArgs,
		log: true,
	});

  if (!isHardhat()) {
    await verifyContract('Bridge', await ethers.getContract('Bridge'), constructorArgs);
  }
};
export default Bridge_Deploy;

Bridge_Deploy.tags = ['Bridge'];
