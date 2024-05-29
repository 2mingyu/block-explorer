// src/components/PLZNFTInfo.tsx
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import PLZNFTABI from '../ABIs/PLZNFT_ABI.json';
import { CONTRACT_ADDRESSES } from '../contracts';

interface PLZNFTInfoProps {
  web3: Web3;
}

const PLZNFTInfo: React.FC<PLZNFTInfoProps> = ({ web3 }) => {
  const [balance, setBalance] = useState<string>('0');
  const [userAddress, setUserAddress] = useState<string>('');
  const [ownsNFT, setOwnsNFT] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const contractAddress = CONTRACT_ADDRESSES.PLZNFT;

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await web3.eth.getBalance(contractAddress);
      setBalance(web3.utils.fromWei(balance, 'ether'));
    };

    fetchBalance();
  }, [web3, contractAddress]); // 의존성 배열에 contractAddress 추가

  const checkOwnership = async () => {
    if (userAddress) {
      if (!web3.utils.isAddress(userAddress)) {
        setError('Invalid address. Please enter a valid Ethereum address.');
        setOwnsNFT(null);
        return;
      }

      setError('');
      const contract = new web3.eth.Contract(PLZNFTABI as any, contractAddress);
      const balance = await contract.methods.balanceOf(userAddress).call();
      setOwnsNFT(Number(balance) > 0);
    }
  };

  return (
    <div>
      <h2>PLZNFT Contract Info</h2>
      <p>Contract Balance: {balance} ETH</p>
      <div>
        <h3>Check NFT Ownership</h3>
        <input
          type="text"
          placeholder="Enter user address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <button onClick={checkOwnership}>Check Ownership</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {ownsNFT !== null && (
          <p>{ownsNFT ? 'User owns the NFT' : 'User does not own the NFT'}</p>
        )}
      </div>
    </div>
  );
};

export default PLZNFTInfo;
