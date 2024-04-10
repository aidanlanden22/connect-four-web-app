import styles from "./../styles/GameTracker.module.css";
export default function GameTracker({ lastPlayer, oppenent, self }) {
  const whoseTurn =
    lastPlayer === self.id ? (
      <span style={{ color: oppenent.color }}>{oppenent.name}'s</span>
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
        <span style={{ color: oppenent.color }}>{oppenent.name}</span>
      </div>
      <div>It is {whoseTurn} turn</div>
    </div>
  );
}
