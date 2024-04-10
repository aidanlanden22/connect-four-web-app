import { useState } from "react";
import styles from "./../styles/PlayerInfo.module.css";
import Colors from "./Colors";

export default function PlayerInfo({ setPlayerInfo }) {
  const [color, setColor] = useState(null);
  const [hasName, setHasName] = useState(false);
  function handleFormData(event) {
    event.preventDefault();
    const name = event.target["name"].value;
    setPlayerInfo({ name: name, color: color });
  }
  function handleNameChange(e) {
    if (e.target.value.length > 0) {
      setHasName(true);
    }
    if (e.target.value.length === 0) {
      setHasName(false);
    }
  }
  return (
    <>
      <form className={styles.playerInfo} onSubmit={handleFormData}>
        <div className={styles.inputField}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            className={styles.input}
            onChange={handleNameChange}
          ></input>
        </div>
        <div className={styles.inputField}>
          <label htmlFor="color">Pick a Color:</label>
          <Colors setColor={setColor} />
        </div>
        <button
          type="submit"
          className={styles.button}
          disabled={!hasName || !color}
        >
          Submit
        </button>
      </form>
    </>
  );
}
