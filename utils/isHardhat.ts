import { network } from 'hardhat';

export const isHardhat = () => {
  const isForked = network?.config?.forking?.enabled ?? false;
  return isForked || network?.name === 'hardhat';
};