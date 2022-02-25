import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Alert, Button, Container, Toast, ToastContainer } from "react-bootstrap";
import web3 from "ethereum/web3";
import Head from "next/head";
import { factory } from "ethereum/contract";
import Link from "next/link";

export default function Layout({ children }: any) {
  const [showChangeNetwork, setShowChangeNetwork] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [showWeb3Warn, setShowWeb3Warn] = useState(false);
  const [newMysteryToast, setNewMysteryToast] = useState<null | object>(null);
  const getChain = async () => {
    const chainId = await web3.eth.getChainId();
    setShowChangeNetwork(chainId != 3);
  };
  useEffect(() => {
    isWeb3Enalbed();
    getChain();
  }, []);

  useEffect(() => {
    if (!showChangeNetwork) {
      const subscribeToEvents = async () => {
        factory.events.MysteryCreated({}, (error, event) => {
          if (event) {
            setNewMysteryToast(event.returnValues);
          }
        })
      }
      subscribeToEvents();
    }
  }, [showChangeNetwork])

  const isWeb3Enalbed = async () => {
    if (window && !(window as any).ethereum) {
      setShowWeb3Warn(true);
    }
  };

  const connectToNetwork = async () => {
    try {
      setSwitching(true);
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        // 0x3 - Ropsten always exist in metamask
        params: [{ chainId: "0x3" }],
      });
    } catch (error: any) {
      console.log(error.message || "failed to switch network");
    } finally {
      setSwitching(false);
    }
  };

  const renderButton = () => {
    return (
      <div className="text-center">
        <Alert>You{"'"}re not Connected to Ropsten Test Network!</Alert>
        <Button onClick={connectToNetwork} disabled={switching}>
          Connect To Ropsten Test Network
        </Button>
      </div>
    );
  };
  return (
    <>
      <Head>
        <title>Welcome To Mystery!</title>
        <meta name="description" content="Solve Mystery and win ETH!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <ToastContainer className="mb-4 mx-4" position="bottom-start">
        <Toast onClose={() => setNewMysteryToast(null)} show={!!newMysteryToast} bg="info" autohide delay={4000}>
          <Toast.Header>
            <strong className="me-auto">Mystery</strong>
          </Toast.Header>
          <Toast.Body className="text-black">
            Woohoo, New <Link href={`/mystery/${newMysteryToast ? newMysteryToast[0] : ''}`}>Mystery</Link> Created!
          </Toast.Body>
        </Toast>
      </ToastContainer>
      <Container className="pt-4 pb-2">
        {showWeb3Warn && (
          <Alert variant="danger" className="mb-2 text-center">
            <span>
              Install any Wallet to Continue like:{" "}
              <a
                target="_blank"
                href="https://metamask.io/download/"
                rel="noreferrer"
              >
                Metamask
              </a>
            </span>
          </Alert>
        )}
        {showChangeNetwork ? renderButton() : children}
      </Container>
      <Footer />
    </>
  );
}
