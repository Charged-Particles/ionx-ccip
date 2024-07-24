import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const CCIPLocal_Deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers } = hre;
  const localSimulatorFactory = await ethers.getContractFactory('CCIPLocalSimulator');
  const localSimulator = await localSimulatorFactory.deploy();

  const config: {
    chainSelector_: bigint;
    sourceRouter_: string;
    destinationRouter_: string;
    wrappedNative_: string;
    linkToken_: string;
    ccipBnM_: string;
    ccipLnM_: string;
  } = await localSimulator.configuration();
};
export default CCIPLocal_Deploy;

CCIPLocal_Deploy.tags = ['CCIPLocal'];
