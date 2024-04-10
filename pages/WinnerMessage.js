import styles from "../styles/WinnerMessage.module.css";

export default function WinnerMessage({ winner, restart }) {
  let className = winner
    ? `${styles.winnerMessage} ${styles.show}`
    : `${styles.winnerMessage}`;

  return (
    <div className={className}>
      <div className={styles.winnerMessageText}>Player ${winner} wins!</div>
      <button className={styles.restart} onClick={restart}>
        Restart
      </button>
    </div>
  );
}
