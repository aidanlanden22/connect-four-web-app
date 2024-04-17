import { useEffect, useState } from "react";
import styles from "./../styles/PlayerInfo.module.css";
import Colors from "./Colors";
let colors = [
  { name: "Green", color: "#22c55e" },
  { name: "Orange", color: "#f59e0b" },
  { name: "Red", color: "#ef4444" },
  { name: "Purple", color: "#8b5cf6" },
  { name: "Pink", color: "#ec4899" },
];

export default function PlayerInfo({
  setPlayerInfo,
  opponentColor,
  startGame,
}) {
  const [color, setColor] = useState(null);
  const [active, setActive] = useState(null);
  const [hasName, setHasName] = useState(false);
  useEffect(() => {
    if (color) setPlayerInfo(color);
  }, [color]);
  function handleSubmit(event) {
    event.preventDefault();
    startGame();
  }

  return (
    <>
      <form className={styles.playerInfo} onSubmit={handleSubmit}>
        {/* <div className={styles.inputField}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            className={styles.input}
            onChange={handleNameChange}
          ></input>
        </div> */}
        <div className={styles.inputField}>
          <label htmlFor="color">Pick a Color:</label>
          {colors.map(({ name, color }, index) => {
            return (
              <div
                className={`${styles.color} ${
                  active == index ? styles.active : ""
                } ${color === opponentColor ? styles.selected : ""}`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  if (color !== opponentColor) {
                    setActive(index);
                    setColor({ name, color });
                  }
                }}
              ></div>
            );
          })}
        </div>
        <button
          type="submit"
          className={styles.button}
          disabled={!opponentColor || !color}
        >
          Start Game
        </button>
      </form>
    </>
  );
}
