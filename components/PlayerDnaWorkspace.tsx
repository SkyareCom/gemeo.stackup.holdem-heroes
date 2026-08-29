"use client";

import {useEffect,useMemo,useState,type ReactNode} from "react";
import {evaluatePlayerDna,type PlayerDnaAnswer} from "@/lib/player-dna";
import {buildBalancedSpotSession} from "@/lib/player-dna-sampler";
import {playerDnaSpots,type GameMode,type PlayerAction,type PlayerDnaSpot} from "@/data/player-dna-spots";
import styles from "./PlayerDnaWorkspace.module.css";

const depths=[100,250,500,1000,1500,3000] as const;
const STORAGE_KEY="stackup.player-dna.session.v1";

type SavedDnaSession={
  mode:GameMode;
  target:number;
  index:number;
  answers:PlayerDnaAnswer[];
  finished:boolean;
  sessionSeed:number;
  updatedAt:number;
};

export default function PlayerDnaWorkspace(){
  const[mode,setMode]=useState<GameMode>("CASH");
  const[target,setTarget]=useState<number|null>(null);
  const[index,setIndex]=useState(0);
  const[answers,setAnswers]=useState<PlayerDnaAnswer[]>([]);
  const[finished,setFinished]=useState(false);
  const[sessionSeed,setSessionSeed]=useState(1);
  const[saved,setSaved]=useState<SavedDnaSession|null>(null);
  const[hydrated,setHydrated]=useState(false);

  const session=useMemo(()=>target?buildBalancedSpotSession(playerDnaSpots,mode,target,sessionSeed):[],[mode,target,sessionSeed]);
  const spot=session[index];
  const result=useMemo(()=>evaluatePlayerDna(session,answers),[session,answers]);

  useEffect(()=>{
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){
        const parsed=JSON.parse(raw) as SavedDnaSession;
        if(parsed&&parsed.target>0&&Array.isArray(parsed.answers)&&parsed.sessionSeed)setSaved(parsed);
      }
    }catch{}
    setHydrated(true);
  },[]);

  useEffect(()=>{
    if(!hydrated||target===null)return;
    const snapshot:SavedDnaSession={mode,target,index,answers,finished,sessionSeed,updatedAt:Date.now()};
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(snapshot));setSaved(snapshot)}catch{}
  },[hydrated,mode,target,index,answers,finished,sessionSeed]);

  function start(depth:number){
    const seed=Date.now();
    setSessionSeed(seed);setTarget(depth);setIndex(0);setAnswers([]);setFinished(false);
  }

  function leave(){setTarget(null);setIndex(0);setAnswers([]);setFinished(false)}

  function continueSaved(){
    if(!saved)return;
    setMode(saved.mode);setTarget(saved.target);setIndex(Math.min(saved.index,Math.max(0,saved.target-1)));setAnswers(saved.answers);setFinished(saved.finished);setSessionSeed(saved.sessionSeed);
  }

  function resetAll(){
    try{localStorage.removeItem(STORAGE_KEY)}catch{}
    setSaved(null);setTarget(null);setIndex(0);setAnswers([]);setFinished(false);setSessionSeed(1);
  }

  function answer(action:PlayerAction){
    if(!spot||!target)return;
    const next=[...answers,{spotId:spot.id,action}];
    setAnswers(next);
    if(next.length>=target){setFinished(true);return}
    setIndex(v=>v+1);
  }

  if(target===null)return <div className={styles.setup}>
    <div><div className="eyebrow">PLAYER DNA</div><h2>DESCUBRA SEU PERFIL</h2><p>Escolha a modalidade e a profundidade do teste. Seu progresso fica salvo neste dispositivo.</p></div>

    {saved&&<div style={{border:"1px solid rgba(92,187,126,.28)",borderRadius:16,padding:16,background:"rgba(9,31,18,.62)",display:"grid",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}>
        <div><div className="eyebrow">TREINO SALVO</div><strong style={{display:"block",marginTop:4}}>{saved.mode} · {saved.answers.length} / {saved.target} SPOTS</strong><small style={{opacity:.65}}>{saved.finished?"AVALIAÇÃO CONCLUÍDA — RESULTADO SALVO":"CONTINUE EXATAMENTE DO PONTO EM QUE PAROU"}</small></div>
        <strong>{Math.round((Math.min(saved.answers.length,saved.target)/saved.target)*100)}%</strong>
      </div>
      <div className={styles.track}><i style={{width:`${(Math.min(saved.answers.length,saved.target)/saved.target)*100}%`}}/></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button className="primary" onClick={continueSaved}>{saved.finished?"VER ANÁLISE":"CONTINUAR TREINO"}</button>
        <button className={styles.modeButton} style={{minHeight:44}} onClick={resetAll}><strong>ZERAR TUDO</strong></button>
      </div>
    </div>}

    <div className={styles.modeGrid}>
      <button className={`${styles.modeButton} ${mode==="CASH"?styles.modeButtonActive:""}`} onClick={()=>setMode("CASH")}><strong>CASH</strong><small>JOGO A DINHEIRO</small></button>
      <button className={`${styles.modeButton} ${mode==="TORNEIO"?styles.modeButtonActive:""}`} onClick={()=>setMode("TORNEIO")}><strong>TORNEIO</strong><small>STACKS, ANTES E ICM</small></button>
    </div>
    <div className={styles.depthGrid}>{depths.map(n=><button key={n} onClick={()=>start(n)}><strong>{n}</strong><span>SPOTS</span></button>)}</div>
    {saved&&<small style={{opacity:.58}}>INICIAR UMA NOVA AVALIAÇÃO SUBSTITUIRÁ O TREINO SALVO QUANDO O PRIMEIRO ESTADO FOR GRAVADO.</small>}
  </div>;

  if(finished)return <div className={styles.result}>
    <div><span className="tag">PLAYER DNA · {mode}</span><h3>{result.label}</h3><p>{answers.length} / {target} SPOTS CONCLUÍDOS · RESULTADO SALVO</p></div>
    <div className={styles.resultGrid}>
      <Metric label="AGRESSÃO" value={`${result.scores.aggression}%`}/><Metric label="DISCIPLINA" value={`${result.scores.discipline}%`}/><Metric label="PRESSÃO" value={`${result.scores.pressure}%`}/><Metric label="PASSIVIDADE" value={`${result.scores.passivity}%`}/>
    </div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="primary" onClick={leave}>VOLTAR</button><button className={styles.modeButton} style={{minHeight:44}} onClick={resetAll}><strong>ZERAR TUDO</strong></button></div>
  </div>;

  if(!spot)return <div className={styles.result}><h3>DADOS INSUFICIENTES</h3><button className="primary" onClick={leave}>VOLTAR</button></div>;

  return <div className={styles.session}>
    <div className={styles.progressHead}><span>SPOT {answers.length+1} / {target}</span><strong>{Math.round((answers.length/target)*100)}%</strong></div>
    <div className={styles.track}><i style={{width:`${(answers.length/target)*100}%`}}/></div>
    <Board spot={spot}/><Pot spot={spot}/><Players spot={spot}/>
    <p className={styles.prompt}>QUAL A SUA AÇÃO?</p>
    <div className={styles.actions}>{spot.actions.map(action=><button key={action} onClick={()=>answer(action)}>{action}</button>)}</div>
    <Scenario spot={spot}/>
    <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginTop:12}}><button className={styles.modeButton} style={{minHeight:44}} onClick={leave}><strong>SALVAR E SAIR</strong></button><button className={styles.modeButton} style={{minHeight:44}} onClick={resetAll}><strong>ZERAR TUDO</strong></button></div>
  </div>;
}

function Board({spot}:{spot:PlayerDnaSpot}){const cards=spot.board?.split(" ").filter(Boolean)??[];return <section className={styles.block}><h4 className={styles.blockTitle}>BOARD</h4><div className={styles.boardRow}><span className={styles.badge}>{spot.street}</span>{cards.length>0&&<div className={styles.cards}>{cards.map(card=><span className={styles.card} key={card}>{card}</span>)}</div>}</div></section>}
function Pot({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>POT</h4><div className={styles.potRows}><div className={styles.potRow}><span className={styles.badge}>MAIN</span><span className={styles.potValue}>{fmt(spot.pot.main,spot.mode)}</span><span className={styles.participants}>{spot.players.map(p=>p.position).join(" · ")}</span></div>{spot.pot.sides?.map((side,i)=><div className={styles.potRow} key={i}><span className={styles.badge}>SIDE {i+1}</span><span className={styles.potValue}>{fmt(side.value,spot.mode)}</span><span className={styles.participants}>{side.players.join(" · ")}</span></div>)}</div></section>}
function Players({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>JOGADORES</h4><div className={styles.players}>{spot.players.map(player=><div className={`${styles.playerRow} ${player.hero?styles.hero:""}`} key={player.position}><Cell label="POSIÇÃO"><span className={styles.badge}>{player.position}</span></Cell><Cell label="CARTAS">{player.hero?<div className={styles.cards}>{spot.heroCards.split(" ").map(card=><span className={styles.card} key={card}>{card}</span>)}</div>:<div className={styles.closedCards}><span className={styles.closed}/><span className={styles.closed}/></div>}</Cell><Cell label="STACK"><span className={styles.value}>{fmt(player.stack,spot.mode)}</span></Cell><Cell label="AÇÃO"><span className={styles.value}>{player.hero?"---":player.action}</span></Cell><Cell label="VALOR"><span className={styles.value}>{player.hero?"---":player.value===0?"---":fmt(player.value,spot.mode)}</span></Cell></div>)}</div></section>}
function Scenario({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>CENÁRIO</h4><div className={styles.scenario}>{spot.scenario.map(item=><span className={styles.badge} key={item}>{item}</span>)}</div></section>}
function Cell({label,children}:{label:string;children:ReactNode}){return <div className={styles.cell}><span className={styles.label}>{label}</span>{children}</div>}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><small>{label}</small><strong>{value}</strong></div>}
function fmt(value:number,mode:GameMode){return mode==="TORNEIO"?`${trim(value)} BB`:`${Math.round(value)}K`}
function trim(value:number){return Number.isInteger(value)?String(value):value.toFixed(1)}