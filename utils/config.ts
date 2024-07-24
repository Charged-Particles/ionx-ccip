import { network } from 'hardhat';
import _ from 'lodash';

const _oppositeChains = {
  1: 34443,
  11155111: 919,
  34443: 1,
  919: 11155111,
};

export const deployConfig = {
  1: {
    router: '0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D',
    chainSelector: 5009297550715157269n,
  },
  11155111: {
    router: '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59',
    chainSelector: 16015286601757825753n,
  },
  34443: {
    router: '0x24C40f13E77De2aFf37c280BA06c333531589bf1',
    chainSelector: 7264351850409363825n,
  },
  919: {
    router: '0xc49ec0eB4beb48B8Da4cceC51AA9A5bD0D0A4c43',
    chainSelector: 829525985033418733n,
  },
};

export const getDeployConfig = ({ oppositeChain = false } = {}) => {
  let chainId = network.config.chainId ?? 1;
  if (oppositeChain) {
    chainId = _.get(_oppositeChains, chainId, 34443);
  }
  return _.get(deployConfig, chainId, { router: '', chainSelector: 0n });
};