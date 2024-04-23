import styles from "./../styles/GameTracker.module.css";
export default function GameTracker({ lastPlayer, opponent, self }) {
  const whoseTurn =
    lastPlayer === self.id ? (
      <span style={{ color: opponent.color }}>{opponent.name}&apos;s</span>
    ) : (
      <span style={{ color: self.color }}>your</span>
    );
  return (
    <div className={styles.gameTrackerContainer}>
      <div>
        Hello <span style={{ color: self.color }}>{self.name}</span>!
      </div>
      <div>
        Your Opponent is{" "}
        <span style={{ color: opponent.color }}>{opponent.name}</span>
      </div>
      <div>It is {whoseTurn} turn</div>
    </div>
  );
}
