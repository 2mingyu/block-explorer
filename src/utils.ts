// src/utils.ts
import Web3 from 'web3';

interface DecodedParams {
  name: string;
  params: { [key: string]: unknown };
}

export const decodeTransactionInput = (web3: Web3, abis: any[], input: string): DecodedParams => {
  const methodID = input.slice(0, 10);
  let method = null;
  for (const abi of abis) {
    method = abi.find((item: any) => item.type === 'function' && web3.eth.abi.encodeFunctionSignature(item) === methodID);
    if (method) break;
  }

  if (!method) {
    return { name: 'N/A', params: {} };
  }

  const decodedParams = web3.eth.abi.decodeParameters(method.inputs, input.slice(10));
  const params: { [key: string]: unknown } = {};

  for (let i = 0; i < method.inputs.length; i++) {
    const paramName = method.inputs[i].name || `param${i}`;
    let paramValue = decodedParams[i];
    if (typeof paramValue === 'bigint') {
      paramValue = paramValue.toString(); // Convert BigInt to string
    }
    params[paramName] = paramValue;
  }

  return { name: method.name, params };
};
