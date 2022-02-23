import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Alert, Button, Container } from 'react-bootstrap'
import web3 from 'ethereum/web3';
import Head from 'next/head';

export default function Layout({ children }: any) {
  const [showChangeNetwork, setShowChangeNetwork] = useState(false);
  const [switching, setSwitching] = useState(false)
  const getChain = async () => {
    const chainId = await web3.eth.getChainId();
    setShowChangeNetwork(chainId != 3)
  }
  useEffect(() => {
    getChain();
  }, [])

  const connectToNetwork = async () => {
    try {
      setSwitching(true)
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        // 0x3 - Ropsten always exist in metamask
        params: [{ chainId: '0x3' }],
      });
    } catch (error: any) {
      console.log(error.message || 'failed to switch network');
    } finally {
      setSwitching(false)
    }
  }

  const renderButton = () => {
    return <div className='text-center'>
      <Alert>You're not Connected to Ropsten Test Network!</Alert>
      <Button onClick={connectToNetwork} disabled={switching}>Connect To Ropsten Test Network</Button>
    </div>
  }
  return <>
    <Head>
      <title>Welcome To Mystery!</title>
      <meta name="description" content="Solve Mystery and win ETH!" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Header />
    <Container className="pt-4 pb-2">
      {
        showChangeNetwork ? renderButton() : children
      }
    </Container>
    <Footer />
  </>
}