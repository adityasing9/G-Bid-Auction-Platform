import { useState, useEffect, createContext, useContext } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Please install MetaMask");
      return;
    }

    try {
      // ✅ STEP 1: Request account FIRST
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // ✅ STEP 2: Force Sepolia BEFORE creating provider
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      if (chainId !== "0xaa36a7") {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      }

      // ✅ STEP 3: NOW create fresh provider + signer
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();

      setAccount(accounts[0]);
      setSigner(_signer);
      setProvider(_provider);
      setError(null);

    } catch (err) {
      console.error(err);
      setError("Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setProvider(null);
  };

  useEffect(() => {
    if (!window.ethereum) return;

    // ✅ Handle account change
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        disconnectWallet();
      }
    };

    // ✅ CRITICAL: handle network change
    const handleChainChanged = () => {
      window.location.reload(); // safest fix
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider value={{ account, signer, provider, error, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);