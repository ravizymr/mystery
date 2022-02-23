import { factory } from "ethereum/contract";
import web3 from "ethereum/web3";
import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import style from "styles/Footer.module.scss";

const Footer = () => {
  const [network, setNetwork] = useState<string>();
  const getNetwork = async () => {
    web3.eth.getChainId().then(async (chainId) => {
      if (chainId == 3) {
        const network = await web3.eth.net.getNetworkType();
        setNetwork(network);
      }
    })
  };

  useEffect(() => {
    getNetwork();
  });

  return (
    <footer className="bg-light">
      <Container fluid className={style.footer}>
        <div>Welcome To Mystery!</div>
        <div>
          {network && <a
            target="_blank"
            href={`https://${network}.etherscan.io/address/${factory.options.address}`}
          >
            View Contract
          </a>}
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
