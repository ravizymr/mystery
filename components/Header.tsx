import { useStateContext } from "context/state";
import Link from "next/link";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import styles from "styles/header.module.scss";

const Header = () => {
  const {
    account,
    web3Supported,
  } = useStateContext();

  const connect = () => {
    try {
      (window as any).ethereum.request({ method: "eth_requestAccounts" });
    } catch (e) {
      console.log('failed to connect');
    }
  }

  return (
    <Navbar className={styles.header}>
      <Container fluid>
        <Link href="/">Mystery</Link>
        <Nav>
          {account && <Link href={"/new"}>
            <a>Create Mystery</a>
          </Link>}
          {account && (
            <Link href={"/account"}>
              <a className={styles.account}>
                Account: {account.substr(0, 4) + "...." + account.substr(-4, 4)}
              </a>
            </Link>
          )}
          {!account && web3Supported && <Button onClick={connect}>Connect</Button>}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
