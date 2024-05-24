import styles from './../styles/WinnerMessage.module.css';

export default function WinnerMessage({ restart, winner, self }) {
  let className = winner
    ? `${styles.winnerMessage} ${styles.show}`
    : `${styles.winnerMessage}`;
  const winnerMessage =
    winner?.id === self
      ? 'Congratualtions, you win!'
      : `${winner?.name} wins :( Better luck next time.`;
  return (
    <div className={className}>
      {winner && (
        <div className={styles.winnerMessageText}>{winnerMessage} </div>
      )}
      <button className={styles.restart} onClick={restart}>
        Restart
      </button>
    </div>
  );
}
