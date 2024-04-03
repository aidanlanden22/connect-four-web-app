import { useState, useEffect } from "react";
import GameBoard from "./GameBoard";
import WinnerMessage from "./WinnerMessage";
import useWebSocket from "react-use-websocket";
import { useCookies } from "react-cookie";
import { v4 as uuid } from "uuid";
import NoAccess from "./NoAccess";

const WS_URL = "ws://localhost:8080/ws";

export default function Game() {
  const [cookies, setCookie] = useCookies(["user"]);
  const [player, setPlayer] = useState({
    id: cookies["user"],
    color: "#f87171",
  });
  //const [player2, setPlayer2] = useState({ id: null, color: "#facc15" });
  const [activePlayer, setActivePlayer] = useState(player);
  //useState(Math.round(Math.random()) ? player1 : player2);
  const [winningMove, setWinningMove] = useState([]);
  const [hasWinner, setHasWinner] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState("");
  const [boardState, setBoardState] = useState(initializeBoard());
  const [isAllowed, setIsAllowed] = useState(true);
  const [lastPlayer, setLastPlayer] = useState(null);

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("WebSocket connection successful");
      if (!lastJsonMessage?.hasOwnProperty("boardState")) {
        sendInitialGameState();
      }
    },
    share: true,
    retryOnError: true,
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (!cookies["user"]) setCookie("user", uuid(), { path: "/" });
    else setIsAllowed(false);
  }, []);

  useEffect(() => {
    if (lastJsonMessage?.hasOwnProperty("boardState")) {
      console.log("got a new message: ", lastJsonMessage);
      //setBoardState(lastJsonMessage.boardState);
    }
  }, [lastJsonMessage]);

  function sendInitialGameState() {
    console.log("sending initial boardstate to websocket");
    const payload = formatGameState(initializeBoard());
    sendJsonMessage(payload);
  }

  function formatGameState(state, opponent = "") {
    console.log(player);
    console.log(state);
    return {
      gameId: "00",
      player: player.id,
      state: JSON.stringify({
        boardState: JSON.stringify(state),
        myself: JSON.stringify([player]),
        opponent: opponent,
        lastPlayer: player.id,
      }),
    };
  }

  function emitBoardState(state) {
    const payload = formatGameState(state);
    console.log(payload);
    sendJsonMessage(payload);
    setLastPlayer(cookies["user"]);
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
        isTurn={lastPlayer !== cookies["user"]}
      />
      <WinnerMessage
        hasWinner={hasWinner}
        winnerMessage={winnerMessage}
        restart={restartGame}
      />
    </div>
  );
}
