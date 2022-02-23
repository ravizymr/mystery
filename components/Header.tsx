import web3 from "ethereum/web3";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import styles from "styles/header.module.scss";


const Header = () => {
  const [account, setAccount] = useState<string>();
  const [network, setNetwork] = useState<string>();
  useEffect(() => {

    (window as any).ethereum &&
      (window as any).ethereum.on("accountsChanged", function (accounts) {
        // Time to reload your interface with accounts[0]!
        window.location.reload();
      });
    (window as any).ethereum.on("chainChanged", function (accounts) {
      // Time to reload your interface with accounts[0]!
      window.location.reload();
    });
    getAccount();
  }, []);

  const getAccount = async () => {
    const network = await web3.eth.net.getNetworkType()
    setNetwork(network)
    const [account] = await web3.eth.getAccounts();
    setAccount(account);
  };
  return (
    <Navbar bg="light" className={styles.header}>
      <Container fluid>
        <Link href="/">Mystery</Link>
        <Nav>
          <Link href={"/new"}>
            <a>Create Mystery</a>
          </Link>
          {account && (
            <Link href={"/account"}>
              <a className={styles.account}>
                Account: {account.substr(0, 4) + "...." + account.substr(-4, 4)}
              </a>
            </Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
