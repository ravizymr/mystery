import React from "react";
import { useStateContext } from "context/state";
import { factory } from "ethereum/contract";
import web3 from "ethereum/web3";
import { Container } from "react-bootstrap";
import style from "styles/Footer.module.scss";

const Footer = () => {
  const {
    chainId,
    network
  } = useStateContext();

  return (
    <footer>
      <Container fluid className={style.footer}>
        <div>Welcome To Mystery!</div>
        <div>
          {network && chainId === 3 && <a
            target="_blank"
            href={`https://${network}.etherscan.io/address/${factory.options.address}`} rel="noreferrer"
          >
            View Contract
          </a>}
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
