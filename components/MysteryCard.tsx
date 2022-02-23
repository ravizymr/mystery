import { factory } from 'ethereum/contract';
import web3 from 'ethereum/web3';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap';
import styles from 'styles/components/MysteryCard.module.scss';

const MysteryCard = ({ address, as }: { address: string, as: any }) => {

  const [data, setData] = useState<any>(null);
  const [solved, setSolved] = useState(false)
  useEffect(() => {
    const getDetail = async () => {
      const detail = await factory.methods.geyMysteryDetail(address).call();
      setData({ ...detail });
      setSolved(!String(detail.winner).endsWith('0000000000000000'))
    }
    web3.eth.getChainId().then((chainId) => {
      if (chainId == 3) {
        getDetail();
      }
    });
  }, [address])


  if (!data) {
    return <div className='text-center'><Spinner animation='grow' /></div>
  }

  const content = <div className={styles.card}>
    <div className={styles.title}>
      <Link href={`/mystery/${address}`}>{data.desc}</Link>
    </div>
    <div className={styles.info}>
      <span>{solved ? 'Solved' : 'Unsolved'}</span>
      <span>
        {'Win: ' + web3.utils.fromWei(String(data.winAmount), 'ether') + 'ETH'}
      </span>
      <span>
        {'Tried By: ' + data.triedCount}
      </span>
    </div>
  </div>;

  const tag = React.createElement(as, {}, content)
  return tag
}

export default MysteryCard;