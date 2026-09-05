"use client";

import {useEffect,useState} from "react";
import styles from "./PlayerDnaPokerTable.module.css";

const seats=[
  {pos:"MP",name:"MIDDLE POSITION",stack:"42 BB"},
  {pos:"MP+2",name:"MP + 2",stack:"34 BB"},
  {pos:"HJ",name:"HIJACK",stack:"31 BB"},
  {pos:"CO",name:"CUTOFF",stack:"24 BB"},
  {pos:"BTN",name:"BUTTON",stack:"33 BB"},
  {pos:"SB",name:"SMALL BLIND",stack:"19 BB"},
  {pos:"BB",name:"BIG BLIND",stack:"52 BB"},
  {pos:"UTG",name:"UNDER THE GUN",stack:"38 BB"},
  {pos:"UTG+1",name:"UTG + 1",stack:"29 BB"}
];

const board=["8♦","J♥","4♣"];

export default function PlayerDnaPokerTable(){
  const[actor,setActor]=useState(0);
  const[boardCount,setBoardCount]=useState(0);

  useEffect(()=>{
    const seatTimer=window.setInterval(()=>setActor(current=>(current+1)%seats.length),950);
    const boardTimer=window.setInterval(()=>setBoardCount(current=>current>=board.length?0:current+1),800);
    return()=>{window.clearInterval(seatTimer);window.clearInterval(boardTimer)};
  },[]);

  return <section className={styles.stage} aria-label="Mesa de poker animada Player DNA">
    <div className={styles.tableShell}>
      <div className={styles.railOuter}>
        <div className={styles.railWood}>
          <div className={styles.felt}>
            <div className={styles.innerOval}/>

            {seats.map((seat,index)=><div key={seat.pos} className={`${styles.seat} ${styles[`seat${index}`]} ${actor===index?styles.active:""}`}>
              <div className={styles.holeCards}><i/><i/></div>
              <div className={styles.namePlate}><strong>{seat.pos}</strong><small>{seat.name}</small></div>
              <div className={styles.chipStack}><i/><i/><i/></div>
              <span className={styles.stack}>{seat.stack}</span>
            </div>)}

            <div className={styles.pot}>$385</div>
            <div className={styles.board}>{[0,1,2,3,4].map(index=><span key={index} className={index<boardCount?styles.cardFace:styles.cardSlot}>{index<boardCount?board[index]:""}</span>)}</div>
            <div className={styles.street}>FLOP</div>

            <div className={styles.deck}><i/><i/><i/></div>
            <div className={styles.dealer}>D</div>

            <div className={styles.heroStack}>$250</div>
            <div className={styles.heroCards}><span>A♠</span><span>K♥</span></div>
            <div className={styles.heroPlate}><strong>HERO</strong><small>YOU</small></div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
