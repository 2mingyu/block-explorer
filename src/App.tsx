// src/App.tsx
import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import BlockNumber from './components/BlockNumber';
import TransactionList from './components/TransactionList';
import RpcUrlInput from './components/RpcUrlInput';
import PLZNFTInfo from './components/PLZNFTInfo';
import PLZTokenInfo from './components/PLZTokenInfo';
import OrderingInfo from './components/OrderingInfo';
import Web3 from 'web3';

const App: React.FC = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [blockNumber, setBlockNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRpcUrlSubmit = (web3Instance: Web3) => {
    setWeb3(web3Instance);
  };

  const fetchBlockNumber = async () => {
    if (web3) {
      setLoading(true);
      try {
        const latestBlockNumber = await web3.eth.getBlockNumber();
        setBlockNumber(Number(latestBlockNumber));
      } catch (error) {
        console.error('Error fetching block number:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBlockNumber();
  }, [web3]);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>PLZCoffee Block Explorer</h1>
          {web3 && blockNumber !== null && <BlockNumber blockNumber={blockNumber} />}
        </header>
        <div className="App-body">
          {!web3 ? (
            <main className="App-content">
              <RpcUrlInput onRpcUrlSubmit={handleRpcUrlSubmit} />
            </main>
          ) : (
            <>
              <aside className="App-sidebar">
                <button onClick={fetchBlockNumber} disabled={loading} className="refresh-button">
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <nav>
                  <ul>
                    <li><Link to="/transactions">Transactions</Link></li>
                    <li><Link to="/plznft">PLZNFT Info</Link></li>
                    <li><Link to="/plztoken">PLZToken Info</Link></li>
                    <li><Link to="/ordering">Ordering Info</Link></li>
                  </ul>
                </nav>
              </aside>
              <main className="App-content">
                <Routes>
                  <Route 
                    path="/transactions" 
                    element={blockNumber !== null ? (
                      <TransactionList 
                        web3={web3} 
                        blockNumber={blockNumber} 
                        onBlockNumberChange={setBlockNumber} 
                      />
                    ) : (
                      <p>Loading...</p>
                    )} 
                  />
                  <Route path="/plznft" element={<PLZNFTInfo web3={web3} />} />
                  <Route path="/plztoken" element={<PLZTokenInfo web3={web3} />} />
                  <Route path="/ordering" element={<OrderingInfo web3={web3} />} />
                </Routes>
              </main>
            </>
          )}
        </div>
      </div>
    </Router>
  );
};

export default App;
