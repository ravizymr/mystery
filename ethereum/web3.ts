import Web3 from "web3";

let web3 : Web3;

if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
  // We are in the browser and metamask is running.
  // (window as any).ethereum.request({ method: "eth_requestAccounts" });
  web3 = new Web3((window as any).ethereum);
} else {
  // We are on the server *OR* the user is not running metamask
  const provider = new Web3.providers.HttpProvider(
    "https://ropsten.infura.io/v3/3d37d8ab639543b9974a550143ea31f0"
  );
  web3 = new Web3(provider);
}

export default web3;
