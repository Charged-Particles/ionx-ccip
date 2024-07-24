import { network } from 'hardhat';
import _ from 'lodash';

const mainnetChains = [ 1, 34443 ];

export const isTestnet = () => {
  const chainId = network.config.chainId ?? 1;
  return !_.includes(mainnetChains, chainId);
};
