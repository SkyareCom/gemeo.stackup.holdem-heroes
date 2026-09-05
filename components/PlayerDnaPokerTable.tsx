"use client";

import { useEffect, useState } from "react";
import styles from "./PlayerDnaPokerTable.module.css";

const seats = [
  { pos: "MP", sub: "Middle Position", stack: "42 BB", cls: "mp" },
  { pos: "MP+2", sub: "MP + 2", stack: "34 BB", cls: "mp2" },
  { pos: "HJ", sub: "Hijack", stack: "31 BB", cls: "hj" },
  { pos: "CO", sub: "Cutoff", stack: "24 BB", cls: "co" },
  { pos: "BTN", sub: "Button", stack: "33 BB", cls: "btn" },
  { pos: "SB", sub: "Small Blind", stack: "19 BB", cls: "sb" },
  { pos: "BB", sub: "Big Blind", stack: "52 BB", cls: "bb" },
  { pos: "UTG", sub: "Under the Gun", stack: "38 BB", cls: "utg" },
  { pos: "UTG+1", sub: "UTG + 1", stack: "29 BB", cls: "utg1" },
];

const actions = ["CALL", "FOLD", "CHECK", "RAISE", "FOLD", "CALL", "CHECK", "RAISE", "CALL"];
const board = ["8♦", "J♥", "4♣"];

export default function PlayerDnaPokerTable() {
  const [actor, setActor] = useState(0);
  const [boardCount, setBoardCount] = useState(3);

  useEffect(() => {
    const actionTimer = window.setInterval(() => {
      setActor((current) => (current + 1) % seats.length);
    }, 1100);

    const boardTimer = window.setInterval(() => {
      setBoardCount((current) => (current === 3 ? 0 : current + 1));
    }, 900);

    return () => {
      window.clearInterval(actionTimer);
      window.clearInterval(boardTimer);
    };
  }, []);

  return (
    <section className={styles.stage} aria-label="Mesa de poker animada Player DNA">
      <div className={styles.tableFrame}>
        <div className={styles.outerRail} />
        <div className={styles.woodRail} />
        <div className={styles.felt}>
          <div className={styles.betLine} />

          {seats.map((seat, index) => (
            <div
              key={seat.pos}
              className={`${styles.seat} ${styles[seat.cls]} ${actor === index ? styles.active : ""}`}
            >
              <div className={styles.backCards} aria-hidden="true"><span /><span /></div>
              <div className={styles.plate}>
                <strong>{seat.pos}</strong>
                <small>({seat.sub})</small>
              </div>
              <div className={styles.chips} aria-hidden="true">
                <i /><i /><i /><i />
              </div>
              <div className={styles.stack}>{seat.stack}</div>
              {actor === index && <div className={styles.action}>{actions[index]}</div>}
            </div>
          ))}

          <div className={styles.pot}>$385</div>
          <div className={styles.board} aria-label="Board">
            {[0, 1, 2, 3, 4].map((index) => (
              <span key={index} className={index < boardCount ? styles.faceCard : styles.emptyCard}>
                {index < boardCount ? board[index] : ""}
              </span>
            ))}
          </div>
          <div className={styles.street}>FLOP</div>

          <div className={styles.deck} aria-hidden="true"><span /><span /><span /><span /></div>
          <div className={styles.dealer}>BUTTON</div>

          <div className={styles.heroStack}>$250</div>
          <div className={styles.heroChips} aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <div className={styles.heroCards} aria-label="Cartas do herói">
            <span className={styles.black}>A♠</span>
            <span className={styles.red}>K♥</span>
          </div>
          <div className={styles.heroPlate}>
            <strong>HERO</strong>
            <small>(You)</small>
          </div>
        </div>
      </div>
    </section>
  );
}
