import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
     * First make sure we have access to the Ethereum object.
     */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalWaves, setTotalWaves] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

  const contractAddress = "0xe4AB1B41Ddb2089154ee07018074BC7370dF2c93";
  const contractABI = abi.abi;

  const getTotalWaves = useCallback(async () => {
    try {
      const ethereum = getEthereumObject();

      /*
       * First make sure we have access to the Ethereum object.
       */
      if (!ethereum) {
        console.error("Make sure you have Metamask!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      let count = await wavePortalContract.getTotalWaves();
      setTotalWaves(count.toNumber());
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [contractABI, setTotalWaves]);

  const getAllWaves = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }, [setAllWaves, contractABI]);

  useEffect(() => {
    findMetaMaskAccount().then((account) => {
      if (account !== null && currentAccount === "") {
        setCurrentAccount(account);
        getTotalWaves();
        getAllWaves();
      }
    });
  }, [currentAccount, getAllWaves, getTotalWaves]);

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Ethereum object doesn't exist!");
        return;
      }

      if (!message) {
        alert("Hey, write something!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const waveTxn = await wavePortalContract.wave(message);
      console.log("Mining...", waveTxn.hash);

      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);

      await Promise.all([getTotalWaves(), getAllWaves()]);
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Que miras bobo? Anda palla </div>

        <div className="bio">
          Hey I'm learning to build smart contracts. Connect your Ethereum
          wallet and wave at me! (This is currently working only on "Goerli
          Network")
        </div>

        <div
          className="bio"
          style={{
            marginBottom: "60px",
          }}
        >
          I received <strong>{totalWaves} wave(s)</strong> already!
        </div>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Start typing here your message, it will be stored on the blockchain!"
        />

        <button className="waveButton" onClick={wave}>
          Hey! 👋
        </button>

        {/*
         * If there is no currentAccount render this button
         */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <div className="header">Messages:</div>

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
