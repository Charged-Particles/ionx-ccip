import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { verifyContract } from '../utils/verifyContract';
import { Ionx, Bridge } from '../typechain-types';
import { isHardhat } from '../utils/isHardhat';
import { isTestnet } from '../utils/isTestnet';
import { log } from '../utils/log';

const LockReleaseTokenPool_Deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers, deployments, getNamedAccounts } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();
  const isMainnet = !isTestnet();

  // Load Ionx Contract
  const ionx = await ethers.getContract('Ionx');
  const ionxAddress = isMainnet ? '0x02D3A27Ac3f55d5D91Fb0f52759842696a864217' : await ionx.getAddress();
  log(` -- IONX Address: ${ionxAddress}`);

  // Load Bridge Contract
  const bridge: Bridge = await ethers.getContract('Bridge');
  const bridgeAddress = await bridge.getAddress();
  log(` -- Bridge Address: ${bridgeAddress}`);

  // Deploy
  const constructorArgs:any = [ ionxAddress, bridgeAddress, deployer ];
	await deploy('LockReleaseTokenPool', {
		from: deployer,
		args: constructorArgs,
		log: true,
	});

  if (!isHardhat()) {
    await verifyContract('LockReleaseTokenPool', await ethers.getContract('LockReleaseTokenPool'), constructorArgs);
  }
};
export default LockReleaseTokenPool_Deploy;

LockReleaseTokenPool_Deploy.tags = ['LockReleaseTokenPool'];
