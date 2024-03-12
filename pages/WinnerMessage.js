import styles from "../styles/WinnerMessage.module.css";

export default function WinnerMessage() {
  return (
    <div class={styles.winnerMessage}>
      <div class={styles.winnerMessageText}></div>
      <button class={styles.restart}>Restart</button>
    </div>
  );
}
