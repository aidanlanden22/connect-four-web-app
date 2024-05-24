import { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import WinnerMessage from './WinnerMessage';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { v4 as uuid } from 'uuid';
import Waiting from './Waiting';
import PlayerInfo from './PlayerInfo';
import GameTracker from './GameTracker';
import styles from './../styles/Game.module.css';
import { useRouter } from 'next/router';
import { Ubuntu_Mono } from 'next/font/google';

const WS_URL = 'ws://localhost:8080/ws';

const ubuntuMono = Ubuntu_Mono({ subsets: ['latin'], weight: '400', variable: '--font-ubuntu-mono', display: 'swap' });

export default function Game() {
  const { isReady, query } = useRouter();

  const [player, setPlayer] = useState({
    name: null,
    color: null,
    id: null,
  });
  const [winner, setWinner] = useState(null);
  const [gameState, setGameState] = useState({
    version: 0,
    boardState: initializeBoard(),
    players: [],
    lastPlayer: null,
    winner: null,
  });

  const [opponentConnected, setOpponentConnected] = useState(false);
  const [opponentColor, setOpponentColor] = useState(null);
  const [gameId, setGameId] = useState(null);

  const { sendJsonMessage, lastJsonMessage, lastMessage, readyState } = useWebSocket(
    WS_URL,
    {
      onOpen: () => {
        console.log('WebSocket connection successful');
      },
      retryOnError: true,
      shouldReconnect: () => true,
    }
  );

  // On initital render generate userId cookie if none, check for other cookie values
  useEffect(() => {
    if(!localStorage.getItem('userId')) {  
      const id = uuid();
      localStorage.setItem('userId', id);
      setPlayer({
        ...player,
        id: id,
      });
    } else {
      console.log('setting Id ', localStorage.getItem('userId'));
      setPlayer({
        ...player,
        id: localStorage.getItem('userId'),
      });
    }
  }, []);

  useEffect(() => {
    const playerId = localStorage.getItem('userId');
    if(isReady && ReadyState.OPEN) {
      setGameId(query.gameId);
      let gameValues = localStorage.getItem(query.gameId);
      if(gameValues) {
        const { version, boardState, players, lastPlayer, winner } = JSON.parse(gameValues);
        // Reaching a race condition when trying to access player id state value set in above use effect hook
        // local storage updates faster and is more reliable in this instance 
        const self = players.find(p => p.id === playerId);
        console.log(self);
        setPlayer({
          id: playerId,
          name: self.name,
          color: self.color,
        });
        setGameState({
          version,
          boardState: boardState,
          players,
          lastPlayer,
          winner
        });
        if(winner) {
          setWinner(winner);
        }

        // If reconnecting, send game state to synchronize with opponent
        const payload = formatGameState({
          version,
          state: boardState,
          players,
          lastPlayer,
          winner,
          currentGameId: query.gameId,
          playerId
        });
        console.log(payload);
        sendJsonMessage(payload);
      }
      else {
        sendJsonMessage({
          gameId: query.gameId,
          // Reaching a race condition when trying to access player id state value set in above use effect hook
          // local storage updates faster and is more reliable in this instance 
          player: playerId,
          state: JSON.stringify({}),
        });
      }
    }
  }, [isReady, readyState]);

  useEffect(() => {
    console.log(lastMessage);
    if (lastMessage && lastMessage.data !== 'failure') {
      setOpponentConnected(true);
    }
  }, [lastMessage]);

  useEffect(() => {
    if(gameState.version) localStorage.setItem(gameId, JSON.stringify(gameState));
  }, [gameState]);

  // TODO: useEffect hook for sending json message with each gamestate upadte

  useEffect(() => {
    // Handle opponent color selection message
    if (lastJsonMessage?.hasOwnProperty('color')) {
      setOpponentColor(lastJsonMessage.color);
      setGameState({
        ...gameState,
        players: [
          {
            name: lastJsonMessage.name,
            color: lastJsonMessage.color,
            id: lastJsonMessage.id,
          },
          player,
        ],
      });
    }

    // Handle opponent board state message
    if (lastJsonMessage?.hasOwnProperty('boardState')) {
      // If oppenent has a less recent game state, send newer version
      if (
        lastJsonMessage.version &&
        lastJsonMessage.version < gameState.version
      ) {
        const payload = formatGameState({ lastPlayer: gameState.lastPlayer });
        sendJsonMessage(payload);
        return;
      }

      setGameState({
        version: lastJsonMessage.version,
        boardState: lastJsonMessage.boardState,
        players: lastJsonMessage.players,
        lastPlayer: lastJsonMessage.lastPlayer,
        winner: lastJsonMessage.winner,
      });
      setWinner(lastJsonMessage.winner);
    }
  }, [lastJsonMessage]);


  // Pull game data out of localStorage
  function getLocalStorage(gameValues) {
    const { version, boardState, players, lastPlayer, winner } = JSON.parse(gameValues);
    setGameState({
      version,
      boardState: boardState,
      players,
      lastPlayer,
      winner
    });
    const self = players.find(p => p.id = player.id );
    setPlayer({
      ...player,
      name: self.name,
      color: self.color,
    });
  }

  // Send color selection to opponent
  function sendInitialGameState(color) {
    sendJsonMessage({
      gameId: gameId,
      player: player.id,
      state: JSON.stringify({
        name: color.name,
        color: color.color,
        id: player.id,
      }),
    });
  }

  function formatGameState({
    version = gameState.version,
    state = gameState.boardState,
    players = gameState.players,
    lastPlayer = player.id,
    winner = null,
    currentGameId = gameId,
    playerId = player.id,
  }) {
    return {
      gameId: currentGameId,
      player: playerId,
      state: JSON.stringify({
        version: version,
        boardState: state,
        players: players,
        lastPlayer: lastPlayer,
        winner: winner,
      }),
    };
  }

  // Send updated board state to opponent following move
  function sendBoardState({ boardState, hasWinner }) {
    const newVersion = gameState.version + 1;
    const payload = formatGameState({
      version: newVersion,
      state: boardState,
      winner: hasWinner ? player : null,
    });
    sendJsonMessage(payload);
    console.log(player);
    setGameState({
      ...gameState,
      boardState: boardState,
      lastPlayer: player.id ?? localStorage.getItem('userId'),
      version: newVersion,
      winner: hasWinner ? player : null
    });
    if (hasWinner) setWinner(player);
  }

  // Initialize empty board
  function initializeBoard() {
    let initialBoard = [];
    for (let i = 0; i < 6; i++) {
      initialBoard[i] = [];
      for (let j = 0; j < 7; j++) {
        initialBoard[i][j] = 0;
      }
    }
    return initialBoard;
  }

  // Initilaize game by generating a random player to go first
  function startGame() {
    const { boardState, players } = gameState;
    // Both players have connected and now the driver player determinines who goes first
    let lastPlayer = gameState.players[Math.round(Math.random())].id;
    let version = 1;
    const payload = formatGameState({
      version: version,
      state: boardState,
      players: players,
      lastPlayer: lastPlayer,
    });
    sendJsonMessage(payload);

    setGameState({
      ...gameState,
      version: version,
      players: players,
      lastPlayer: lastPlayer,
    });
  }

  // Set player info following color selection
  function setPlayerInfo(color) {
    // Update Player color
    setPlayer({
      ...player,
      name: color.name,
      color: color.color,
    });

    // Update self in players gameState
    setGameState({
      ...gameState,
      players: [
        gameState.players.find((p) => p?.id !== player.id),
        {
          name: color.name,
          color: color.color,
          id: player.id,
        },
      ],
    });

    const gameValues = localStorage.getItem(gameId);
    if(gameValues) {
      localStorage.setItem(gameId, JSON.stringify({
        ...JSON.parse(gameValues),
        userName: color.name,
        userColor: color.color,
      }));
    } else {
      localStorage.setItem(gameId, JSON.stringify({
        userName: color.name,
        userColor: color.color,
      }));
    }

    sendInitialGameState(color);
  }

  // Helper function to get opponent from players list
  function getOtherPlayer() {
    const id = player.id ?? localStorage.getItem('userId');
    return gameState.players.find((p) => p.id !== id);
  }

  function restartGame() {
    setWinner(null);
    const lastPlayer = gameState.players[Math.round(Math.random())].id;
    const version = gameState.version + 1;
    const newBoard = initializeBoard();
    setGameState({
      ...gameState,
      version: version,
      boardState: newBoard,
      lastPlayer: lastPlayer,
      winner: null,
    });
    const payload = formatGameState({ lastPlayer, state: newBoard });
    sendJsonMessage(payload);
  }

  return (
    <div className={`${styles.game} ${ubuntuMono.variable}`}>
      {gameState.lastPlayer && (
        <GameTracker
          lastPlayer={gameState.lastPlayer}
          opponent={getOtherPlayer()}
          self={player}
        />
      )}
      <GameBoard
        player={player}
        boardState={gameState.boardState}
        sendBoardState={sendBoardState}
        isTurn={gameState.lastPlayer !== player.id}
      />
      <WinnerMessage restart={restartGame} winner={winner} self={player.id} />
      {!opponentConnected && <Waiting />}
      {opponentConnected && !gameState.lastPlayer && (
        <PlayerInfo
          setPlayerInfo={setPlayerInfo}
          opponentColor={opponentColor}
          startGame={startGame}
        />
      )}
    </div>
  );
}
