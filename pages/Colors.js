import styles from "./../styles/Colors.module.css";
const colors = ["#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Colors({ setColor }) {
  return (
    <>
      {colors.map((color) => {
        return (
          <div
            className={styles.color}
            style={{ backgroundColor: color }}
            onClick={() => setColor(color)}
          ></div>
        );
      })}
    </>
  );
}
