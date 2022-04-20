import React from 'react';
import './App.css';
import { useWallet } from './context/WalletProvider';

function App() {
  const { isAuthenticated, connectWallet, disconnectWallet } = useWallet();
  return (
    <div className="App">
      <header className="App-header">
        <h3>Nft Prize Locker</h3>
        <button onClick={isAuthenticated ? disconnectWallet : connectWallet} id="wallet-connect">
          {isAuthenticated ? "Disconnect Wallet" : "Connect Wallet"}
        </button>
      </header>
      <div className="App-body">
        <button>Mint</button>
        <button>Sponsor</button>
        <button>Acquire</button>
        <button>Claim</button>
        <button>Set Transferable Status</button>
        <button>Manage</button>
      </div>
    </div>
  );
}

export default App;
