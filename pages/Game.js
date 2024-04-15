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

const WS_URL = "ws://localhost:8080/ws";

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
  const gameId = router.query.gameId ?? cookies["gameId"];

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("WebSocket connection successful");
      // If recconecting, send game state to syncrhonize with oppoenent
      if (cookies["gameState"]) {
        const payload = formatGameState({ lastPlayer: gameState.lastPlayer });
        console.log(payload);
        sendJsonMessage(payload);
      }
    },
    share: true,
    retryOnError: true,
    shouldReconnect: () => true,
  });

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

  useEffect(() => {
    if (gameId && !cookies["gameId"]) {
      setCookie("gameId", gameId, { path: "/" });
    }
  }, [gameId]);

  useEffect(() => {
    if (gameState.version) setCookie("gameState", gameState, { path: "/" });
  }, [gameState]);

  useEffect(() => {
    console.log(gameState);
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

      let players = lastJsonMessage.players;
      let lastPlayer = lastJsonMessage.lastPlayer;
      let version = lastJsonMessage.version;
      // Both players have connected and now the driver player determinines who goes first
      if (!lastJsonMessage.players.some((p) => p.id === player.id)) {
        players.push(player);
        lastPlayer = players[Math.round(Math.random())].id;
        version = 1;
        const payload = formatGameState({
          version: version,
          state: lastJsonMessage.boardState,
          players: players,
          lastPlayer: lastPlayer,
        });
        sendJsonMessage(payload);
      }

      setGameState({
        version: version,
        boardState: lastJsonMessage.boardState,
        players: players,
        lastPlayer: lastPlayer,
        winner: lastJsonMessage.winner,
      });
      if (lastJsonMessage.winner) setWinner(lastJsonMessage.winner);
    }
  }, [lastJsonMessage]);

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

  function sendInitialGameState({ name, color }) {
    const payload = formatGameState({
      state: initializeBoard(),
      lastPlayer: null,
      players: [{ name: name, color: color, id: player.id }],
    });
    console.log("sending initial payload...", payload);
    sendJsonMessage(payload);
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

  function sendBoardState({ boardState, hasWinner }) {
    console.log("has winner: ", hasWinner);
    const payload = formatGameState({
      version: gameState.version++,
      state: boardState,
      winner: hasWinner ? player : null,
    });
    sendJsonMessage(payload);
    setGameState({
      ...gameState,
      boardState: boardState,
      lastPlayer: player.id,
      version: gameState.version++,
    });
    if (hasWinner) setWinner(player);
  }

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

  function setPlayerInfo({ name, color }) {
    setPlayer({
      ...player,
      name: name,
      color: color,
    });
    setCookie("username", name, { path: "/" });
    setCookie("userColor", color, { path: "/" });
    sendInitialGameState({ name: name, color: color });
  }

  function getOtherPlayer() {
    return gameState.players.find((p) => p.id !== player.id);
  }

  /*function restartGame() {
    setHasWinner(false);
    setBoardState(initializeBoard());
    setActivePlayer(Math.round(Math.random()) ? player1 : player2);
  }*/

  return (
    <div className={styles.game}>
      {gameState.lastPlayer && (
        <GameTracker
          lastPlayer={gameState.lastPlayer}
          oppenent={getOtherPlayer()}
          self={player}
        />
      )}
      <GameBoard
        player={player}
        boardState={gameState.boardState}
        sendBoardState={sendBoardState}
        isTurn={gameState.lastPlayer !== player.id}
      />
      <WinnerMessage restart={() => {}} winner={winner} self={player.id} />
      {!player.name && <PlayerInfo setPlayerInfo={setPlayerInfo} />}
      {!gameState.lastPlayer && player.name && <Waiting />}
    </div>
  );
}
