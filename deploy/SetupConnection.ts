import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Configuration } from '../typechain-types';
import { performTx } from '../utils/performTx';
import { getDeployConfig, ionxMainnetAddress } from '../utils/config';
import { isSourceChain } from '../utils/isSourceChain';
import { isTestnet } from '../utils/isTestnet';
import { log } from '../utils/log';
import _ from 'lodash';

const Setup_Connection: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { ethers } = hre;
  const isMainnet = !isTestnet();

  const path = isTestnet() ? ['sepolia', 'modeSepolia'] : ['mainnet', 'mode'];
  const { address: sourceBridgeAddress } = require(`../deployments/${path[0]}/Bridge.json`);
  const { address: sourceTokenAddress } = require(`../deployments/${path[0]}/Ionx.json`);
  const { address: destBridgeAddress } = require(`../deployments/${path[1]}/Bridge.json`);
  const { address: destTokenAddress } = require(`../deployments/${path[1]}/IonxCCIP.json`);

  if (_.isEmpty(sourceBridgeAddress) || _.isEmpty(sourceTokenAddress) || _.isEmpty(destBridgeAddress) || _.isEmpty(destTokenAddress)) {
    log('Source & Destination Contract Addresses are Empty!  Exiting..');
    return;
  }

  // CONNECTING THE CHAINS
  //   Setup the Remote Bridges
  log(`--- Setting Connections on ${isSourceChain() ? 'Source' : 'Destination'} Chain ---`);

  // const deployConfig = getDeployConfig();
  const deployConfigOpp = getDeployConfig({ oppositeChain: true });
  // log(` -- Deploy Configuration: {router: "${deployConfig.router}", chainSelector: ${deployConfig.chainSelector} }`);

  // Load Configuration Contract
  const config: Configuration = await ethers.getContract('Configuration');
  const configAddress = await config.getAddress();
  log(` -- Configuration Address: ${configAddress}`);

  // Set Remote Bridge for Configuration Contract
  await performTx(
    await config.setRemoteBridge(deployConfigOpp.chainSelector, isSourceChain() ? destBridgeAddress : sourceBridgeAddress),
    ' -- Remote Bridge Set for Configuration Contract!'
  );

  // Set Extra-Args for Configuration Contract
  await performTx(
    await config.setExtraArgsGasLimit(deployConfigOpp.chainSelector, 300_000n),
    ' -- Extra-Args Set for Configuration Contract!'
  );

  // Set Destination Token for Configuration Contract
  const realSourceToken = (isMainnet ? ionxMainnetAddress : sourceTokenAddress);
  const sourceToken = isSourceChain() ? realSourceToken : destTokenAddress;
  const destToken = isSourceChain() ? destTokenAddress : realSourceToken;
  await performTx(
    await config.setDestinationToken(sourceToken, deployConfigOpp.chainSelector, destToken),
    ' -- Destination Token Set for Configuration Contract!'
  );

  log(`--- ${isSourceChain() ? 'Source' : 'Destination'} Chain Connection Setup Complete! ---`);
};
export default Setup_Connection;

Setup_Connection.tags = ['SetupConnection'];
