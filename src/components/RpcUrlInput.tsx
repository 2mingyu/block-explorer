// src/components/RpcUrlInput.tsx
import React, { useState } from 'react';
import Web3 from 'web3';

interface RpcUrlInputProps {
  onRpcUrlSubmit: (web3Instance: Web3) => void;
}

const RpcUrlInput: React.FC<RpcUrlInputProps> = ({ onRpcUrlSubmit }) => {
  const [rpcUrl, setRpcUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const web3Instance = new Web3(new Web3.providers.HttpProvider(rpcUrl));
      await web3Instance.eth.net.isListening();
      onRpcUrlSubmit(web3Instance);
      setError(null);
    } catch (error) {
      setError('Invalid RPC URL. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Enter RPC URL:
        <input
          type="text"
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
          required
        />
      </label>
      <button type="submit">Connect</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default RpcUrlInput;
