"use client";

import {useEffect,useMemo,useState} from "react";
import type {AnteFormat,PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";
import styles from "./AnimatedPlayerDnaTable.module.css";

type Props={spot:PlayerDnaSpot;anteMode:AnteFormat;selectedAction:PlayerAction|null;onSequenceReady:(ready:boolean)=>void};
type Seat={position:string;stack:number;action:string;value:number;hero?:boolean;placeholder?:boolean};

const allPositions=["UTG","UTG+1","MP","MP+1","LJ","HJ","CO","BTN","SB","BB"];

export default function AnimatedPlayerDnaTable({spot,selectedAction,onSequenceReady}:Props){
  const hero=spot.players.find(player=>player.hero)??spot.players[0];
  const opponents=spot.players.filter(player=>!player.hero);
  const flow=useMemo(()=>opponents.map((player,index)=>({...player,id:`${spot.id}-${player.position}-${index}`})),[spot.id,opponents]);
  const[actionStep,setActionStep]=useState(-1);
  const[ready,setReady]=useState(false);
  const[visibleBoard,setVisibleBoard]=useState(0);
  const boardCards=useMemo(()=>spot.board?.split(" ").filter(Boolean)??[],[spot.board]);

  useEffect(()=>{
    setActionStep(-1);setReady(false);setVisibleBoard(0);onSequenceReady(false);
    const start=window.setTimeout(()=>setActionStep(0),250);
    return()=>window.clearTimeout(start);
  },[spot.id,onSequenceReady]);

  useEffect(()=>{
    if(actionStep<0)return;
    if(actionStep>=flow.length){
      setReady(true);onSequenceReady(true);
      let shown=0;
      const boardTimer=window.setInterval(()=>{shown+=1;setVisibleBoard(Math.min(shown,boardCards.length));if(shown>=boardCards.length)window.clearInterval(boardTimer)},220);
      return()=>window.clearInterval(boardTimer);
    }
    const timer=window.setTimeout(()=>setActionStep(step=>step+1),flow[actionStep].action==="FOLD"?850:1050);
    return()=>window.clearTimeout(timer);
  },[actionStep,flow,boardCards.length,onSequenceReady]);

  const preferred=allPositions.filter(position=>position!==hero.position).slice(0,9);
  const used=new Set<string>();
  const ringSeats:Seat[]=preferred.map(position=>{
    const found=opponents.find(player=>!used.has(player.position)&&player.position===position);
    if(found){used.add(found.position);return found}
    return{position,stack:0,action:"",value:0,placeholder:true};
  });
  opponents.filter(player=>!used.has(player.position)).forEach(player=>{
    const slot=ringSeats.findIndex(seat=>seat.placeholder);
    if(slot>=0)ringSeats[slot]=player;
  });

  const active=actionStep>=0&&actionStep<flow.length?flow[actionStep]:null;
  const completedIds=new Set(flow.slice(0,Math.max(0,actionStep)).map(item=>item.id));
  const potLabel=fmt(spot.pot.main,spot.mode);
  const toCall=Math.min(hero.stack,Math.max(0,...opponents.filter(player=>player.action!=="FOLD").map(player=>player.value)));

  return <section className={styles.shell} aria-label="Mesa animada do spot">
    <div className={styles.table}>
      <div className={styles.felt}>
        <div className={styles.innerRail}/>
        {ringSeats.map((seat,index)=>{
          const flowItem=flow.find(item=>item.position===seat.position);
          const isActive=Boolean(active&&flowItem&&active.id===flowItem.id);
          const isFolded=Boolean(flowItem&&completedIds.has(flowItem.id)&&flowItem.action==="FOLD");
          return <div key={`${seat.position}-${index}`} className={`${styles.seat} ${styles[`seat${index}`]} ${isActive?styles.active:""} ${isFolded?styles.folded:""} ${seat.placeholder?styles.placeholder:""}`}>
            <div className={styles.cardBacks}><i/><i/></div>
            <div className={styles.nameplate}><strong>{seat.position}</strong><span>{seat.placeholder?"—":fmt(seat.stack,spot.mode)}</span></div>
            {!seat.placeholder&&<div className={styles.chips}><i/><i/><i/></div>}
            {isActive&&<div className={styles.actionTag}>{seat.action}{seat.value>0?` · ${fmt(seat.value,spot.mode)}`:""}</div>}
          </div>
        })}

        <div className={styles.pot}><small>POT</small><strong>{potLabel}</strong>{spot.pot.sides?.map((side,index)=><span key={index}>SIDE {index+1} · {fmt(side.value,spot.mode)}</span>)}</div>
        <div className={styles.board}>{[0,1,2,3,4].map(index=>{const card=boardCards[index];const visible=index<visibleBoard&&card;return <span key={index} className={visible?styles.faceCard:styles.emptyCard}>{visible?card:""}</span>})}</div>
        <div className={styles.street}>{spot.street}</div>

        <div className={`${styles.heroSeat} ${ready?styles.heroReady:""}`}>
          <div className={styles.heroCards}>{spot.heroCards.split(" ").map(card=><span key={card}>{card}</span>)}</div>
          <div className={styles.heroPlate}><strong>HERO · {hero.position}</strong><span>{fmt(hero.stack,spot.mode)}</span></div>
          <div className={styles.heroAction}>{ready?(selectedAction??"SUA VEZ"):`TO CALL ${fmt(toCall,spot.mode)}`}</div>
        </div>
      </div>
    </div>
    <div className={styles.status} aria-live="polite">{ready?"AÇÃO LIBERADA PARA O HERO":active?`${active.position} · ${active.action}${active.value>0?` · ${fmt(active.value,spot.mode)}`:""}`:"PREPARANDO SPOT"}</div>
  </section>;
}

function fmt(value:number,mode:PlayerDnaSpot["mode"]){if(mode==="TORNEIO")return `${Number.isInteger(value)?value:value.toFixed(1)} BB`;return `${Math.round(value)}K`}
