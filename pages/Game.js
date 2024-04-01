import { useState, useEffect } from "react";
import GameBoard from "./GameBoard";
import WinnerMessage from "./WinnerMessage";
import useWebSocket from "react-use-websocket";

const WS_URL = "ws://localhost:8080/ws";

export default function Game() {
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("WebSocket connection successful");
    },
    share: true,
    shouldReconnect: () => true,
  });

  useEffect(() => {
    console.log("got a new message: ", lastJsonMessage);
  }, [lastJsonMessage]);

  const player1 = { id: 1, color: "#f87171" };
  const player2 = { id: 2, color: "#facc15" };
  const [activePlayer, setActivePlayer] = useState(
    Math.round(Math.random()) ? player1 : player2
  );
  const [winningMove, setWinningMove] = useState([]);
  const [hasWinner, setHasWinner] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState("");
  const [boardState, setBoardState] = useState(initializeBoard());

  function emitBoardState(state) {
    sendJsonMessage({
      gameId: "00",
      player: "01",
      state: JSON.stringify(state),
    });
    setBoardState(state);
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
  function switchPlayerTurn() {
    if (winningMove.length) declareWinner();
    else setActivePlayer(activePlayer.id === player1.id ? player2 : player1);
  }
  function declareWinner() {
    setWinnerMessage("Player " + activePlayer.id + " wins!");
    setHasWinner(true);
  }
  function restartGame() {
    setHasWinner(false);
    setBoardState(initializeBoard());
    setActivePlayer(Math.round(Math.random()) ? player1 : player2);
  }
  return (
    <div className="game">
      <GameBoard
        activePlayer={activePlayer}
        switchPlayerTurn={switchPlayerTurn}
        setWinningMove={setWinningMove}
        declareWinner={declareWinner}
        boardState={boardState}
        sendBoardState={emitBoardState}
      />
      <WinnerMessage
        hasWinner={hasWinner}
        winnerMessage={winnerMessage}
        restart={restartGame}
      />
    </div>
  );
}
