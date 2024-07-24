import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verifyContract';
import { IonxCCIP, Bridge } from '../typechain-types';
import { isHardhat } from '../utils/isHardhat';
import { log } from '../utils/log';

const BurnMintTokenPool_Deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

  // Load Ionx Contract
  const ionx: IonxCCIP = await ethers.getContract('IonxCCIP');
  const ionxAddress = await ionx.getAddress();
  log(` -- IONX Address: ${ionxAddress}`);

  // Load Bridge Contract
  const bridge: Bridge = await ethers.getContract('Bridge');
  const bridgeAddress = await bridge.getAddress();
  log(` -- Bridge Address: ${bridgeAddress}`);

  // Deploy
  const constructorArgs:any = [ ionxAddress, bridgeAddress ];
	await deploy('BurnMintTokenPool', {
		from: deployer,
		args: constructorArgs,
		log: true,
	});

  if (!isHardhat()) {
    await verifyContract('BurnMintTokenPool', await ethers.getContract('BurnMintTokenPool'), constructorArgs);
  }
};
export default BurnMintTokenPool_Deploy;

BurnMintTokenPool_Deploy.tags = ['BurnMintTokenPool'];
