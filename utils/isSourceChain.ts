import { network } from 'hardhat';
import _ from 'lodash';

const sourceChains = [ 1, 11155111 ];

export const isSourceChain = () => {
  const chainId = network.config.chainId ?? 1;
  return _.includes(sourceChains, chainId);
};
