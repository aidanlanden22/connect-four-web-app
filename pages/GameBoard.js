import Column from "./Column";
import WinnerMessage from "./WinnerMessage";
import styles from "../styles/GameBoard.module.css";
export default function GameBoard() {
  return (
    <div className={styles.gameBoard}>
      <Column />
      <Column />
      <Column />
      <Column />
      <Column />
      <Column />
      <Column />
      <WinnerMessage />
    </div>
  );
}
