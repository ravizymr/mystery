import web3 from "ethereum/web3";
import { createContext, useContext, useEffect, useState } from "react";

const StateContext = createContext<{
  connected: boolean,
  account: string,
  network: string,
  chainId: number,
  web3Supported: boolean
}>({
  connected: false,
  account: '',
  network: '',
  chainId: 0,
  web3Supported: true
});

const StateWrapper = (props) => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string>();
  const [network, setNetwork] = useState('ropsten');
  const [chainId, setChainId] = useState(0x03);
  const [web3Supported, setWeb3Supported] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
      (window as any).ethereum.on("accountsChanged", function (accounts) {
        // Time to reload your interface with accounts[0]!
        window.location.reload();
      });
      (window as any).ethereum.on("chainChanged", function (accounts) {
        // Time to reload your interface with accounts[0]!
        window.location.reload();
      });
      getDetail();
    } else {
      setWeb3Supported(false)
    }
  }, [])

  const getDetail = async () => {
    // get active account detail
    const [account] = await web3.eth.getAccounts();
    setAccount(account);
    setConnected(!account);

    // get chainId
    const chainId = await web3.eth.getChainId();
    setChainId(chainId);

    // get current network
    const network = await web3.eth.net.getNetworkType()
    setNetwork(network)
  }

  const state = { connected, network, chainId, web3Supported, account }

  return (
    <StateContext.Provider {...props} value={state} />
  );
}

export default StateWrapper

export function useStateContext() {
  return useContext(StateContext);
}