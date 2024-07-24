import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verifyContract';
import { isHardhat } from '../utils/isHardhat';

const Ionx_Deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

  // Deploy
  const constructorArgs:any = [];
	await deploy('Ionx', {
		from: deployer,
		args: constructorArgs,
		log: true,
	});

  if (!isHardhat()) {
    await verifyContract('Ionx', await ethers.getContract('Ionx'), constructorArgs);
  }
};
export default Ionx_Deploy;

// Ionx_Deploy.dependencies = ['Ionx'];
Ionx_Deploy.tags = ['Ionx'];
