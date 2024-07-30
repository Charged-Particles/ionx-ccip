import { ContractTransactionReceipt, ContractTransactionResponse, EventLog, Log } from 'ethers';
import { log } from './log';

export const performTx = async (tx: ContractTransactionResponse, msg: string):Promise<string> => {
  const rc: ContractTransactionReceipt | null = await tx.wait(3);
  if (rc !== null) {

    if (rc?.logs?.length > 0 && msg.includes('{id}')) {
      const evt: EventLog | Log = rc.logs[0];
      // @ts-ignore
      if (evt?.args?.length == 3) {
        // @ts-ignore
        const data = evt.args[2];
        msg = msg.replace(/\{id}/ig, data);
      }
    }

    log(msg);
  }
  return tx.hash;
};
