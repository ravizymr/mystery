import web3 from 'ethereum/web3';
import Link from 'next/link';
import React, { useState } from 'react'
import styles from 'styles/components/MysteryCard.module.scss';
import { ImysteryData } from 'types';

const MysteryCard = ({ mystery, as }: { mystery: ImysteryData, as: any }) => {

  const [data] = useState<ImysteryData>(mystery);
  const solved = !String(data.winner).endsWith('0000000000000000')

  const content = <div className={styles.card}>
    <div className={styles.title}>
      <Link passHref href={`/mystery/${mystery.mystery}`}><a>{data.desc}</a></Link>
    </div>
    <div className={styles.info}>
      <span>{solved ? 'Solved' : 'Unsolved'}</span>
      <span>
        {'Win: ' + web3.utils.fromWei(String(data.winAmount || 0), 'ether') + 'ETH'}
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