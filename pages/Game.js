import { useState, useEffect } from "react";
import GameBoard from "./GameBoard";
import WinnerMessage from "./WinnerMessage";
import useWebSocket from "react-use-websocket";
import { useCookies } from "react-cookie";
import { v4 as uuid } from "uuid";
import Waiting from "./Waiting";
import PlayerInfo from "./PlayerInfo";
import GameTracker from "./GameTracker";
import styles from "./../styles/Game.module.css";

const WS_URL = "ws://localhost:8080/ws";

export default function Game() {
  const [cookies, setCookie] = useCookies(["userId", "userColor", "username"]);
  const [player, setPlayer] = useState({
    name: null,
    color: null,
    id: cookies["userId"],
  });
  const [winner, setWinner] = useState(null);
  const [gameState, setGameState] = useState({
    boardState: initializeBoard(),
    players: [player],
    lastPlayer: null,
    winner: null,
  });

  const { sendJsonMessage, lastJsonMessage, lastMessage, readyState } =
    useWebSocket(WS_URL, {
      onOpen: () => {
        console.log("WebSocket connection successful");
      },
      share: true,
      retryOnError: true,
      shouldReconnect: () => true,
    });

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
    if (lastJsonMessage?.hasOwnProperty("boardState")) {
      let players = lastJsonMessage.players;
      let lastPlayer = lastJsonMessage.lastPlayer;
      // both players have connected and now the driver player is determining who goes first
      if (!lastJsonMessage.players.some((p) => p.id === player.id)) {
        players.push(player);
        lastPlayer = players[Math.round(Math.random())].id;
        console.log("setting last player... ", lastPlayer);
        const payload = formatGameState({
          state: lastJsonMessage.boardState,
          players: players,
          lastPlayer: lastPlayer,
        });
        sendJsonMessage(payload);
      }
      setGameState({
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
        name: cookies["username"],
        color: cookies["userColor"],
      });
    }
  }

  function sendInitialGameState() {
    const payload = formatGameState({
      state: initializeBoard(),
      lastPlayer: null,
      players: [player],
    });
    console.log("sending initial payload...", payload);
    sendJsonMessage(payload);
  }

  function formatGameState({
    state,
    players = gameState.players,
    lastPlayer = player.id,
    winner = null,
  }) {
    return {
      gameId: "00",
      player: player.id,
      state: JSON.stringify({
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
      state: boardState,
      winner: hasWinner ? player : null,
    });
    sendJsonMessage(payload);
    setGameState({
      ...gameState,
      boardState: boardState,
      lastPlayer: player.id,
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
    sendInitialGameState();
  }

  function getOtherPlayer() {
    return gameState.players.find((p) => p.id !== player.id);
  }

  /*function restartGame() {
    setHasWinner(false);
    setBoardState(initializeBoard());
    setActivePlayer(Math.round(Math.random()) ? player1 : player2);
  }*/

  console.log(player);
  console.log(gameState);
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
      <WinnerMessage restart={() => {}} winner={winner?.id} />
      {!player.name && <PlayerInfo setPlayerInfo={setPlayerInfo} />}
      {!gameState.lastPlayer && player.name && <Waiting />}
    </div>
  );
}
