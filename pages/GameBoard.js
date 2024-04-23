import Column from "./Column";
import styles from "./../styles/GameBoard.module.css";

const columns = Array.from(Array(7).keys());
export default function GameBoard({
  player,
  boardState,
  sendBoardState,
  isTurn,
}) {
  function dropPiece(column) {
    if (isTurn) {
      for (let i = 5; i >= 0; i--) {
        if (boardState[i][column] === 0) {
          let updatedBoard = boardState;
          updatedBoard[i][column] = player;
          let winningMove = checkForWinner(i, column, player?.id);
          sendBoardState({
            boardState: updatedBoard,
            hasWinner: winningMove.length ? true : false,
          });
          break;
        }
      }
    }
  }

  function checkForWinner(row, column, playerId) {
    let winningMove = [];
    let currentSequence = [{ row, column }];
    // Check vertical downwards
    for (let i = row + 1; i < 6; i++) {
      if (boardState[i][column].id === playerId)
        currentSequence.push({ row: i, column });
      else break;
    }

    // If 4 or more, add winning move
    if (currentSequence.length >= 4) winningMove.push(...currentSequence);
    //setWinningMove((prevState) => [...prevState, ...currentSequence]);
    // Reset current sequence to last move
    currentSequence.length = 1;

    // Check horizontal left
    for (let i = column - 1; i >= 0; i--) {
      if (boardState[row][i].id === playerId)
        currentSequence.push({ row, column: i });
      else break;
    }

    // We don't need to check or reset current sequence between left and right checks since they're continuous
    // Check horizontal right
    for (let i = column + 1; i < 7; i++) {
      if (boardState[row][i].id === playerId) {
        currentSequence.push({ row, column: i });
      } else break;
    }

    if (currentSequence.length >= 4) winningMove.push(...currentSequence);
    //setWinningMove((prevState) => [...prevState, ...currentSequence]);
    currentSequence.length = 1;

    //Check down right and up right
    for (let i = row + 1, j = column - 1; i < 6 && j >= 0; i++, j--) {
      if (boardState[i][j].id === playerId)
        currentSequence.push({ row: i, column: j });
      else break;
    }
    for (let i = row - 1, j = column + 1; i >= 0 && j < 7; i--, j++) {
      if (boardState[i][j].id === playerId)
        currentSequence.push({ row: i, column: j });
      else break;
    }

    if (currentSequence.length >= 4) winningMove.push(...currentSequence);
    //setWinningMove((prevState) => [...prevState, ...currentSequence]);
    currentSequence.length = 1;

    //check up left and down left
    for (let i = row - 1, j = column - 1; i >= 0 && j >= 0; i--, j--) {
      if (boardState[i][j].id === playerId)
        currentSequence.push({ row: i, column: j });
      else break;
    }
    for (let i = row + 1, j = column + 1; i < 6 && j < 7; i++, j++) {
      if (boardState[i][j].id === playerId)
        currentSequence.push({ row: i, column: j });
      else break;
    }

    if (currentSequence.length >= 4) winningMove.push(...currentSequence);
    //setWinningMove((prevState) => [...prevState, ...currentSequence]);
    return winningMove;
  }

  return (
    <div className={styles.gameBoard}>
      {columns.map((i) => {
        return (
          <Column
            playerColor={player?.color}
            dropPiece={() => dropPiece(i)}
            columnState={boardState.map((row) => row[i])}
            isTurn={isTurn}
            key={i}
          />
        );
      })}
    </div>
  );
}
