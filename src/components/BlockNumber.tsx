// src/components/BlockNumber.tsx
import React from 'react';

interface BlockNumberProps {
  blockNumber: number;
}

const BlockNumber: React.FC<BlockNumberProps> = ({ blockNumber }) => {
  return (
    <div className="block-number">
      <p>Latest Block Number: {blockNumber}</p>
    </div>
  );
};

export default BlockNumber;
