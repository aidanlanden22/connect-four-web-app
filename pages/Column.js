import { useEffect, useState } from "react";
import styles from "./../styles/Column.module.css";
export default function Column({
  playerColor,
  dropPiece,
  columnState,
  isTurn,
}) {
  const [headerStyles, setHeaderStyles] = useState("white");
  const [cellColor, setCellColor] = useState(Array(6).fill("white"));
  const [isHovered, setIsHovered] = useState(false);
  //const [animations, setAnimations] = useState(Array(6).fill(""));

  useEffect(() => {
    let columnColors = [];
    for (const [index, player] of columnState.entries()) {
      if (player === 0) columnColors[index] = "white";
      else columnColors[index] = player.color;
    }
    setCellColor(columnColors.length == 6 ? columnColors : cellColor);
    if (isHovered) setHeaderStyles(`${playerColor}`);
  }, [columnState]);
  function handleHover(event) {
    if (event === "onEnter" && isTurn) {
      setIsHovered(true);
      setHeaderStyles(`${playerColor}`);
    } else {
      setIsHovered(false);
      setHeaderStyles("white");
    }
  }

  /*const animateMove = () => {
    let emptyCells = columnState.reduce((accumulator, currentValue) => {
      if (currentValue === 0) accumulator++;
      return accumulator;
    });
    for (let i = 0; i < emptyCells; i++) {
      setTimeout(() => {
        animations[i] = `${styles.animated}`;
      }, 85.7 * i);
    }
    dropPiece();
  }; */

  return (
    <div
      className={styles.column}
      onMouseEnter={() => handleHover("onEnter")}
      onMouseLeave={() => handleHover("onLeave")}
      onClick={dropPiece}
    >
      <div
        className={styles.columnHeader}
        style={{ backgroundColor: headerStyles }}
      ></div>
      <div className={styles.columnContents}>
        <div
          className={`${styles.cell}`}
          style={{ backgroundColor: cellColor[0] }}
        ></div>
        <div
          className={styles.cell}
          style={{ backgroundColor: cellColor[1] }}
        ></div>
        <div
          className={styles.cell}
          style={{ backgroundColor: cellColor[2] }}
        ></div>
        <div
          className={styles.cell}
          style={{ backgroundColor: cellColor[3] }}
        ></div>
        <div
          className={styles.cell}
          style={{ backgroundColor: cellColor[4] }}
        ></div>
        <div
          className={styles.cell}
          style={{ backgroundColor: cellColor[5] }}
        ></div>
      </div>
    </div>
  );
}
