import styles from "../styles/Column.module.css";
export default function Column() {
  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}></div>
      <div className={styles.columnContents}>
        <div className={styles.cell}></div>
        <div className={styles.cell}></div>
        <div className={styles.cell}></div>
        <div className={styles.cell}></div>
        <div className={styles.cell}></div>
        <div className={styles.cell}></div>
      </div>
    </div>
  );
}
