// src/components/BlockNumber.tsx
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';

interface BlockNumberProps {
  web3: Web3;
  onBlockNumberChange: (blockNumber: number) => void;
}

const BlockNumber: React.FC<BlockNumberProps> = ({ web3, onBlockNumberChange }) => {
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    const fetchBlockNumber = async () => {
      try {
        const latestBlockNumber = await web3.eth.getBlockNumber();
        setBlockNumber(Number(latestBlockNumber));
        onBlockNumberChange(Number(latestBlockNumber));
      } catch (error) {
        console.error('Error fetching block number:', error);
      }
    };

    fetchBlockNumber();
  }, [web3, onBlockNumberChange]);

  return (
    <div className="block-number">
      {blockNumber !== null ? <p>Latest Block Number: {blockNumber}</p> : <p>Loading...</p>}
    </div>
  );
};

export default BlockNumber;
