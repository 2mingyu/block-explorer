// src/web3.ts
import Web3 from 'web3';

export const createWeb3Instance = (rpcUrl: string): Web3 => {
  return new Web3(new Web3.providers.HttpProvider(rpcUrl));
};
