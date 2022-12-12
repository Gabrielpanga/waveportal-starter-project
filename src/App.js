import * as React from "react";
import { ethers } from "ethers";
import './App.css';

export default function App() {

  const wave = () => {
    
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Que miras bobo?
        </div>

        <div className="bio">
          Hey I'm learning to build smart contracts.
          Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Hi!
        </button>
      </div>
    </div>
  );
}
