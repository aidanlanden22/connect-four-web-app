import { useState } from "react";
import styles from "./../styles/Colors.module.css";
const colors = ["#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Colors({ setColor }) {
  const [active, setActive] = useState(null);
  return (
    <>
      {colors.map((color, index) => {
        return (
          <div
            className={`${styles.color} ${
              active == index ? styles.active : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => {
              setActive(index);
              setColor(color);
            }}
          ></div>
        );
      })}
    </>
  );
}
