"use client";

import {useMemo,useState,type ReactNode} from "react";
import {evaluatePlayerDna,type PlayerDnaAnswer} from "@/lib/player-dna";
import {playerDnaSpots,type GameMode,type PlayerAction,type PlayerDnaSpot} from "@/data/player-dna-spots";
import styles from "./PlayerDnaWorkspace.module.css";

const depths=[100,300,500,1000,3000] as const;

export default function PlayerDnaWorkspace(){
  const[mode,setMode]=useState<GameMode>("CASH");
  const[target,setTarget]=useState<number|null>(null);
  const[index,setIndex]=useState(0);
  const[answers,setAnswers]=useState<PlayerDnaAnswer[]>([]);
  const[finished,setFinished]=useState(false);

  const pool=useMemo(()=>playerDnaSpots.filter(s=>s.mode===mode),[mode]);
  const spot=pool[index%pool.length];
  const result=useMemo(()=>evaluatePlayerDna(playerDnaSpots,answers),[answers]);

  function start(depth:number){setTarget(depth);setIndex(0);setAnswers([]);setFinished(false)}
  function reset(){setTarget(null);setIndex(0);setAnswers([]);setFinished(false)}
  function answer(action:PlayerAction){
    if(!spot||!target)return;
    const next=[...answers,{spotId:spot.id,action}];
    setAnswers(next);
    if(next.length>=target){setFinished(true);return}
    setIndex(v=>v+1);
  }

  if(target===null)return <div className={styles.setup}>
    <div><div className="eyebrow">PLAYER DNA</div><h2>DESCUBRA SEU PERFIL</h2><p>Escolha a modalidade e a profundidade do teste.</p></div>
    <div className={styles.modeGrid}>
      <button className={`${styles.modeButton} ${mode==="CASH"?styles.modeButtonActive:""}`} onClick={()=>setMode("CASH")}><strong>CASH</strong><small>JOGO A DINHEIRO</small></button>
      <button className={`${styles.modeButton} ${mode==="TORNEIO"?styles.modeButtonActive:""}`} onClick={()=>setMode("TORNEIO")}><strong>TORNEIO</strong><small>STACKS, ANTES E ICM</small></button>
    </div>
    <div className={styles.depthGrid}>{depths.map(n=><button key={n} onClick={()=>start(n)}><strong>{n}</strong><span>SPOTS</span></button>)}</div>
  </div>;

  if(finished)return <div className={styles.result}>
    <div><span className="tag">PLAYER DNA · {mode}</span><h3>{result.label}</h3></div>
    <div className={styles.resultGrid}>
      <Metric label="AGRESSÃO" value={`${result.scores.aggression}%`}/><Metric label="DISCIPLINA" value={`${result.scores.discipline}%`}/><Metric label="PRESSÃO" value={`${result.scores.pressure}%`}/><Metric label="PASSIVIDADE" value={`${result.scores.passivity}%`}/>
    </div>
    <button className="primary" onClick={reset}>NOVA AVALIAÇÃO</button>
  </div>;

  return <div className={styles.session}>
    <div className={styles.progressHead}><span>SPOT {answers.length+1} / {target}</span><strong>{Math.round(((answers.length+1)/target)*100)}%</strong></div>
    <div className={styles.track}><i style={{width:`${((answers.length+1)/target)*100}%`}}/></div>
    <Board spot={spot}/><Pot spot={spot}/><Players spot={spot}/><Scenario spot={spot}/>
    <p className={styles.prompt}>{spot.prompt}</p>
    <div className={styles.actions}>{spot.actions.map(action=><button key={action} onClick={()=>answer(action)}>{action}</button>)}</div>
  </div>;
}

function Board({spot}:{spot:PlayerDnaSpot}){const cards=spot.board?.split(" ").filter(Boolean)??[];return <section className={styles.block}><h4 className={styles.blockTitle}>BOARD</h4><div className={styles.boardRow}><span className={styles.badge}>{spot.street}</span>{cards.length>0&&<div className={styles.cards}>{cards.map(card=><span className={styles.card} key={card}>{card}</span>)}</div>}</div></section>}

function Pot({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>POT</h4><div className={styles.potRows}><div className={styles.potRow}><span className={styles.badge}>MAIN</span><span className={styles.potValue}>{fmt(spot.pot.main,spot.mode)}</span><span className={styles.participants}>{spot.players.map(p=>p.position).join(" · ")}</span></div>{spot.pot.sides?.map((side,i)=><div className={styles.potRow} key={i}><span className={styles.badge}>SIDE {i+1}</span><span className={styles.potValue}>{fmt(side.value,spot.mode)}</span><span className={styles.participants}>{side.players.join(" · ")}</span></div>)}</div></section>}

function Players({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>JOGADORES</h4><div className={styles.players}>{spot.players.map(player=><div className={`${styles.playerRow} ${player.hero?styles.hero:""}`} key={player.position}><Cell label="POSIÇÃO"><span className={styles.badge}>{player.position}</span></Cell><Cell label="CARTAS">{player.hero?<div className={styles.cards}>{spot.heroCards.split(" ").map(card=><span className={styles.card} key={card}>{card}</span>)}</div>:<div className={styles.closedCards}><span className={styles.closed}/><span className={styles.closed}/></div>}</Cell><Cell label="STACK"><span className={styles.value}>{fmt(player.stack,spot.mode)}</span></Cell><Cell label="AÇÃO"><span className={styles.value}>{player.action}</span></Cell><Cell label="VALOR"><span className={styles.value}>{player.value===0?"—":fmt(player.value,spot.mode)}</span></Cell></div>)}</div></section>}

function Scenario({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>CENÁRIO</h4><div className={styles.scenario}>{spot.scenario.map(item=><span className={styles.badge} key={item}>{item}</span>)}</div></section>}
function Cell({label,children}:{label:string;children:ReactNode}){return <div className={styles.cell}><span className={styles.label}>{label}</span>{children}</div>}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><small>{label}</small><strong>{value}</strong></div>}
function fmt(value:number,mode:GameMode){return mode==="TORNEIO"?`${trim(value)} BB`:`${Math.round(value)}K`}
function trim(value:number){return Number.isInteger(value)?String(value):value.toFixed(1)}
