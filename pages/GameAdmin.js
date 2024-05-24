import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import styles from '../styles/GameAdmin.module.css';
import { useEffect } from 'react';

const ROUTE = 'Game/';
const DOMAIN = 'connectfour.xyz/';
export default function GameAdmin() {
  const router = useRouter();
  const [gameId, setGameId] = useState(null);
  const [games, setGames] = useState([]);
  function generateGameId() {
    const id = uuid();
    navigator.clipboard.writeText(`${DOMAIN + ROUTE}?gameId=${id}`);
    setGameId(id);
  }
  function goToRoute({id = gameId}) {
    console.log(id);
    router.push({ pathname: ROUTE, query: { gameId: id } });
  }

  useEffect(() => {
    let gamesInBrowser = [];
    if(typeof localStorage !== 'undefined') {
      const items = { ...localStorage };
      console.log('in here');
      for(const [key, value] of Object.entries(items)) {
        console.log('key: ', key);
        console.log('value: ', value);
        try {
          const gameContents = JSON.parse(value);
          if(!gameContents.hasOwnProperty('boardState') || gameContents.winner) {
            continue;
          }
          gamesInBrowser.push({
            gameId: key, 
            ...gameContents
          });
        } catch {
          continue;
        }
       
      }

    }
    setGames(gamesInBrowser);

  }, []);

  function getOpponent(game) {
    const self = localStorage.getItem('userId');
    console.log(game);
    return game.players.find(p => p.id !== self).name;
  }

  return (
    <>
      <div className={styles.adminContainer}>
      Welcome to Stateless Connect Four!
        <button className={styles.button} onClick={generateGameId} disabled={gameId}>
        Generate Game
        </button>
        <button className={styles.button} disabled={!gameId} onClick={goToRoute}>
        Go to Game
        </button>
        <div className={styles.gamesHeader}>Active Games</div>
        <div className={styles.gamesContainer}>
          {games.length ? games.map((game, index) => {
            return (
              <div className={styles.game} key={index} onClick={() => goToRoute({id:game.gameId})}>
                {`${game.gameId} versus ${getOpponent(game)}`}
              </div>
            );
          }) : <div> No games yet :(</div>}
        </div>
      </div>
      
    </>
  );
}
