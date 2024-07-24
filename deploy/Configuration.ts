import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verifyContract';
import { isHardhat } from '../utils/isHardhat';

const Configuration_Deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

  // Deploy
  const constructorArgs:any = [];
	await deploy('Configuration', {
		from: deployer,
		args: constructorArgs,
		log: true,
	});

  if (!isHardhat()) {
    await verifyContract('Configuration', await ethers.getContract('Configuration'), constructorArgs);
  }
};
export default Configuration_Deploy;

Configuration_Deploy.tags = ['Configuration'];
