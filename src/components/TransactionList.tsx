// src/components/TransactionList.tsx
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { decodeTransactionInput } from '../utils';
import OrderingABI from '../ABIs/Ordering_ABI.json';
import PLZTokenABI from '../ABIs/PLZToken_ABI.json';
import PLZNFTABI from '../ABIs/PLZNFT_ABI.json';
import { CONTRACT_ADDRESSES } from '../contracts';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  functionName: string;
  params: { [key: string]: unknown };
}

interface TransactionListProps {
  web3: Web3;
  blockNumber: number;
  onBlockNumberChange: (blockNumber: number) => void;
}

const CONTRACT_NAMES: { [key: string]: string } = {
  [CONTRACT_ADDRESSES.Ordering]: 'Ordering',
  [CONTRACT_ADDRESSES.PLZNFT]: 'PLZNFT',
  [CONTRACT_ADDRESSES.PLZToken]: 'PLZToken',
};

const TransactionList: React.FC<TransactionListProps> = ({ web3, blockNumber, onBlockNumberChange }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const latestBlockNumber = await web3.eth.getBlockNumber();
      onBlockNumberChange(Number(latestBlockNumber));
      let currentBlockNumber = latestBlockNumber;
      let txs: Transaction[] = [];

      while (txs.length < 100 && currentBlockNumber >= 0) {
        const block = await web3.eth.getBlock(currentBlockNumber, true);
        if (block && block.transactions) {
          const blockTxs = await Promise.all(
            block.transactions.map(async (tx: any) => {
              let functionName = 'N/A';
              let params = {};
              try {
                const decoded = decodeTransactionInput(web3, [OrderingABI, PLZTokenABI, PLZNFTABI], tx.input);
                functionName = decoded.name;
                params = decoded.params;
              } catch (error) {
                console.error('Error decoding transaction input', error);
              }
              return {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: web3.utils.fromWei(tx.value, 'ether'), // Convert value to ETH
                timestamp: new Date(Number(block.timestamp) * 1000).toLocaleString(), // Convert timestamp to readable format
                functionName,
                params,
              };
            })
          );
          txs = [...txs, ...blockTxs];
        }
        currentBlockNumber--;
      }

      setTransactions(txs.slice(0, 100)); // Ensure only 100 transactions are set
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [web3, blockNumber]);

  const shortenAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    alert('Address copied to clipboard!');
  };

  const displayAddress = (address: string) => {
    return CONTRACT_NAMES[address] || shortenAddress(address);
  };

  return (
    <div>
      <div className="header-with-button">
        <h2>Latest Transactions</h2>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="transaction-list">
          <div className="transaction-list-header">
            <div>Hash</div>
            <div>From</div>
            <div>To</div>
            <div>Value (ETH)</div>
            <div>Timestamp</div>
            <div>Function</div>
            <div>Params</div>
          </div>
          {transactions.map(tx => (
            <div key={tx.hash} className="transaction-list-item">
              <div>
                <span title={tx.hash} onClick={() => copyToClipboard(tx.hash)} className="address">
                  {shortenAddress(tx.hash)}
                </span>
              </div>
              <div>
                <span title={tx.from} onClick={() => copyToClipboard(tx.from)} className="address">
                  {displayAddress(tx.from)}
                </span>
              </div>
              <div>
                <span title={tx.to} onClick={() => copyToClipboard(tx.to)} className="address">
                  {displayAddress(tx.to)}
                </span>
              </div>
              <div>{tx.value}</div>
              <div className="timestamp">{tx.timestamp}</div>
              <div>{tx.functionName}</div>
              <div>
                {tx.functionName !== 'N/A' && (
                  <details>
                    <summary>View Params</summary>
                    <pre>{JSON.stringify(tx.params, (key, value) => 
                      typeof value === 'bigint' ? value.toString() : value, 2)}</pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
