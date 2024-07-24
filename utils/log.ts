import { isHardhat } from '../utils/isHardhat';

export const log = (...args: any) => {
  // if (isHardhat()) { return; }
  console.log(...args);
};