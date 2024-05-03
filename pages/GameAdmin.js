import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import styles from '../styles/GameAdmin.module.css';

const ROUTE = 'Game/';
const DOMAIN = 'connectfour.xyz/';
export default function GameAdmin() {
  const router = useRouter();
  const [gameId, setGameId] = useState(null);
  function generateGameId() {
    const id = uuid();
    navigator.clipboard.writeText(`${DOMAIN + ROUTE}?gameId=${id}`);
    setGameId(id);
  }
  function goToRoute() {
    router.push({ pathname: ROUTE, query: { gameId } });
  }

  return (
    <div className={styles.adminContainer}>
      Welcome to Stateless Connect Four!
      <button className={styles.button} onClick={generateGameId} disabled={gameId}>
        Generate Game
      </button>
      <button className={styles.button} disabled={!gameId} onClick={goToRoute}>
        Go to Game
      </button>
    </div>
  );
}
