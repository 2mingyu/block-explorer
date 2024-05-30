// src/components/PLZTokenInfo.tsx
import React, { useState } from 'react';
import Web3 from 'web3';
import PLZTokenABI from '../ABIs/PLZToken_ABI.json';
import { CONTRACT_ADDRESSES } from '../contracts';

interface PLZTokenInfoProps {
  web3: Web3;
}

const PLZTokenInfo: React.FC<PLZTokenInfoProps> = ({ web3 }) => {
  const [userAddress, setUserAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [lastRequestedAt, setLastRequestedAt] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const contractAddress = CONTRACT_ADDRESSES.PLZToken;

  const checkBalance = async () => {
    if (userAddress) {
      if (!web3.utils.isAddress(userAddress)) {
        setError('Invalid address. Please enter a valid Ethereum address.');
        setBalance('0');
        setLastRequestedAt(null);
        return;
      }

      setError('');
      const contract = new web3.eth.Contract(PLZTokenABI as any, contractAddress);
      const balance = await contract.methods.balanceOf(userAddress).call();
      setBalance(web3.utils.fromWei(Number(balance), 'ether'));

      const lastRequestedAtTimestamp = await contract.methods.lastRequestedAt(userAddress).call();
      const date = new Date(Number(lastRequestedAtTimestamp) * 1000);
      setLastRequestedAt(date.toLocaleString());
    }
  };

  return (
    <div>
      <h2>PLZToken Balance Checker</h2>
      <div>
        <input
          type="text"
          placeholder="Enter user address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <button onClick={checkBalance}>Check Balance</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p>User Balance: {balance} PLZ</p>
        {lastRequestedAt && <p>Last Requested At: {lastRequestedAt}</p>}
      </div>
    </div>
  );
};

export default PLZTokenInfo;
