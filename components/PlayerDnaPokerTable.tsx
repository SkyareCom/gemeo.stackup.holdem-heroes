"use client";

import { useEffect, useState } from "react";
import styles from "./PlayerDnaPokerTable.module.css";

const seats = [
  { pos: "MP", stack: "42", cls: "mp" },
  { pos: "MP+2", stack: "34", cls: "mp2" },
  { pos: "HJ", stack: "31", cls: "hj" },
  { pos: "CO", stack: "24", cls: "co" },
  { pos: "BTN", stack: "33", cls: "btn" },
  { pos: "SB", stack: "19", cls: "sb" },
  { pos: "BB", stack: "52", cls: "bb" },
  { pos: "UTG", stack: "38", cls: "utg" },
  { pos: "UTG+1", stack: "29", cls: "utg1" },
];

const board = [
  { rank: "8", suit: "♦", red: true },
  { rank: "J", suit: "♥", red: true },
  { rank: "4", suit: "♣", red: false },
];

export default function PlayerDnaPokerTable() {
  const [actor, setActor] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActor((v) => (v + 1) % seats.length), 1200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className={styles.stage} aria-label="Mesa de poker animada Player DNA">
      <div className={styles.table}>
        <div className={styles.outerRail} />
        <div className={styles.woodRail} />
        <div className={styles.felt}>
          <div className={styles.betLine} />

          {seats.map((seat, index) => (
            <div key={seat.pos} className={`${styles.seat} ${styles[seat.cls]} ${actor === index ? styles.active : ""}`}>
              <div className={styles.cardBacks}><span /><span /></div>
              <div className={styles.plate}>{seat.pos}</div>
              <div className={styles.miniChips}><i /><i /><i /></div>
              <div className={styles.stack}>{seat.stack} BB</div>
            </div>
          ))}

          <div className={styles.pot}>$385</div>
          <div className={styles.board}>
            {board.map((card) => (
              <span key={`${card.rank}${card.suit}`} className={card.red ? styles.redCard : styles.blackCard}>
                <b>{card.rank}</b><em>{card.suit}</em>
              </span>
            ))}
          </div>
          <div className={styles.street}>FLOP</div>

          <div className={styles.deck}><i /><span /></div>
          <div className={styles.dealer}>D</div>

          <div className={styles.heroChips}><i /><i /><i /><i /><i /></div>
          <div className={styles.heroStack}>$250</div>
          <div className={styles.heroCards}>
            <span className={styles.blackCard}><b>A</b><em>♠</em></span>
            <span className={styles.redCard}><b>K</b><em>♥</em></span>
          </div>
          <div className={styles.heroPlate}><strong>HERO</strong><small>(YOU)</small></div>
        </div>
      </div>
    </section>
  );
}
