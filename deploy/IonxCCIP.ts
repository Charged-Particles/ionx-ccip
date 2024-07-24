import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verifyContract';
import { isHardhat } from '../utils/isHardhat';

const IonxCCIP_Deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

  // Deploy
  const constructorArgs:any = [];
	await deploy('IonxCCIP', {
		from: deployer,
		args: constructorArgs,
		log: true,
	});

  if (!isHardhat()) {
    await verifyContract('IonxCCIP', await ethers.getContract('IonxCCIP'), constructorArgs);
  }
};
export default IonxCCIP_Deploy;

// IonxCCIP_Deploy.dependencies = ['Ionx'];
IonxCCIP_Deploy.tags = ['IonxCCIP'];
