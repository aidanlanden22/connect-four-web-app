import styles from "../styles/WinnerMessage.module.css";

export default function WinnerMessage({ hasWinner, winnerMessage, restart }) {
  let className = hasWinner
    ? `${styles.winnerMessage} ${styles.show}`
    : `${styles.winnerMessage}`;

  return (
    <div className={className}>
      <div className={styles.winnerMessageText}>{winnerMessage}</div>
      <button className={styles.restart} onClick={restart}>
        Restart
      </button>
    </div>
  );
}
