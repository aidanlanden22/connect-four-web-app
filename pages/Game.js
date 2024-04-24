import { useState, useEffect, useLayoutEffect } from "react";
import GameBoard from "./GameBoard";
import WinnerMessage from "./WinnerMessage";
import useWebSocket from "react-use-websocket";
import { useCookies } from "react-cookie";
import { v4 as uuid } from "uuid";
import Waiting from "./Waiting";
import PlayerInfo from "./PlayerInfo";
import GameTracker from "./GameTracker";
import styles from "./../styles/Game.module.css";
import { useRouter } from "next/router";

const WS_URL = "ws://159.203.173.100:8080/ws";

export default function Game() {
  const router = useRouter();
  const [cookies, setCookie] = useCookies([
    "userId",
    "userColor",
    "username",
    "gameId",
    "gameState",
  ]);
  const [player, setPlayer] = useState({
    name: null,
    color: null,
    id: cookies["userId"],
  });
  const [winner, setWinner] = useState(null);
  const [gameState, setGameState] = useState({
    version: 0,
    boardState: initializeBoard(),
    players: [player],
    lastPlayer: null,
    winner: null,
  });
  const [oppponentConnected, setOpponentConnected] = useState(false);
  const [opponentColor, setOpponentColor] = useState(null);
  let gameId = router.query.gameId ?? cookies["gameId"];

  // Will use to send initital websocket message once gameId and player id are set
  let ready = gameId && player.id;

  const { sendJsonMessage, lastJsonMessage, lastMessage } = useWebSocket(
    WS_URL,
    {
      onOpen: () => {
        console.log("WebSocket connection successful");
        // If recconecting, send game state to syncrhonize with oppoenent
        if (cookies["gameState"]) {
          const payload = formatGameState({
            lastPlayer: gameState.lastPlayer,
          });
          sendJsonMessage(payload);
        }
      },
      retryOnError: true,
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    console.log(lastMessage);
    if (lastMessage && lastMessage.data !== "failure") {
      setOpponentConnected(true);
    }
  }, [lastMessage]);

  // On initital render generate userId cookie if none, check for other cookie values
  useEffect(() => {
    if (!cookies["userId"]) {
      const id = uuid();
      setCookie("userId", id, { path: "/" });
      setPlayer({
        ...player,
        id: id,
      });
    }
    checkForCookies();
  }, []);

  // Once gameId has loaded from the router for the first time, set cookie
  useEffect(() => {
    if (gameId && !cookies["gameId"]) {
      setCookie("gameId", gameId, { path: "/" });
    }
  }, [gameId]);

  // Once the gameId and player id is set, let other player know we've connected
  useEffect(() => {
    if (ready && !cookies["gameState"]) {
      sendJsonMessage({
        gameId: gameId,
        player: player.id,
        state: JSON.stringify({}),
      });
    }
  }, [ready]);

  // Update gameState cookie every time theres a change
  useEffect(() => {
    if (gameState.version) setCookie("gameState", gameState, { path: "/" });
  }, [gameState]);

  // TODO: useEffect hook for sending json message with each gamestate upadte

  useEffect(() => {
    // Handle opponent color selection message
    if (lastJsonMessage?.hasOwnProperty("color")) {
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
    if (lastJsonMessage?.hasOwnProperty("boardState")) {
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

  // Load cookie values into state if any
  function checkForCookies() {
    if (cookies["username"]) {
      setPlayer({
        ...player,
        name: cookies["username"],
        color: cookies["userColor"],
      });
    }
    if (cookies["gameState"]) {
      setGameState(cookies["gameState"]);
    }
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
  }) {
    return {
      gameId: gameId,
      player: player.id,
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
    setGameState({
      ...gameState,
      boardState: boardState,
      lastPlayer: player.id,
      version: newVersion,
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
        gameState.players.find((p) => p.id !== player.id),
        {
          name: color.name,
          color: color.color,
          id: player.id,
        },
      ],
    });

    setCookie("username", color.name, { path: "/" });
    setCookie("userColor", color.color, { path: "/" });
    sendInitialGameState(color);
  }

  // Helper function to get opponent from players list
  function getOtherPlayer() {
    return gameState.players.find((p) => p.id !== player.id);
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
    <div className={styles.game}>
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
      {!oppponentConnected && <Waiting />}
      {oppponentConnected && !gameState.lastPlayer && (
        <PlayerInfo
          setPlayerInfo={setPlayerInfo}
          opponentColor={opponentColor}
          startGame={startGame}
        />
      )}
    </div>
  );
}
