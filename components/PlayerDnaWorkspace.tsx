"use client";

import {useEffect,useMemo,useState,type ReactNode} from "react";
import {evaluatePlayerDna,type PlayerDnaAnswer} from "@/lib/player-dna";
import {buildBalancedSpotSession} from "@/lib/player-dna-sampler";
import {playerDnaSpots,type GameMode,type PlayerAction,type PlayerDnaSpot} from "@/data/player-dna-spots";
import styles from "./PlayerDnaWorkspace.module.css";

const depths=[100,250,500,1000,1500,3000] as const;
const STORAGE_KEY="stackup.player-dna.library.v2";
const LEGACY_STORAGE_KEY="stackup.player-dna.session.v1";

type SavedDnaSession={
  mode:GameMode;
  target:number;
  index:number;
  answers:PlayerDnaAnswer[];
  finished:boolean;
  sessionSeed:number;
  updatedAt:number;
};

type DnaScores={aggression:number;discipline:number;pressure:number;passivity:number};
type DnaReport=SavedDnaSession&{
  id:string;
  name:string;
  completedAt:number;
  result:{label:string;scores:DnaScores};
};

type DnaLibrary={active:SavedDnaSession|null;reports:DnaReport[]};

const emptyLibrary:DnaLibrary={active:null,reports:[]};

export default function PlayerDnaWorkspace(){
  const[mode,setMode]=useState<GameMode>("CASH");
  const[target,setTarget]=useState<number|null>(null);
  const[index,setIndex]=useState(0);
  const[answers,setAnswers]=useState<PlayerDnaAnswer[]>([]);
  const[finished,setFinished]=useState(false);
  const[sessionSeed,setSessionSeed]=useState(1);
  const[library,setLibrary]=useState<DnaLibrary>(emptyLibrary);
  const[hydrated,setHydrated]=useState(false);
  const[historyOpen,setHistoryOpen]=useState(false);
  const[selectedReportId,setSelectedReportId]=useState<string|null>(null);
  const[editingId,setEditingId]=useState<string|null>(null);
  const[editingName,setEditingName]=useState("");

  const session=useMemo(()=>target?buildBalancedSpotSession(playerDnaSpots,mode,target,sessionSeed):[],[mode,target,sessionSeed]);
  const spot=session[index];
  const result=useMemo(()=>evaluatePlayerDna(session,answers),[session,answers]);
  const selectedReport=library.reports.find(report=>report.id===selectedReportId)??null;

  useEffect(()=>{
    let next:DnaLibrary=emptyLibrary;
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){
        const parsed=JSON.parse(raw) as DnaLibrary;
        if(parsed&&Array.isArray(parsed.reports))next={active:parsed.active??null,reports:parsed.reports};
      }else{
        const legacy=localStorage.getItem(LEGACY_STORAGE_KEY);
        if(legacy){
          const parsed=JSON.parse(legacy) as SavedDnaSession;
          if(parsed&&parsed.target>0&&Array.isArray(parsed.answers))next={active:parsed.finished?null:parsed,reports:[]};
        }
      }
    }catch{}
    setLibrary(next);setHydrated(true);
  },[]);

  useEffect(()=>{
    if(!hydrated)return;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(library))}catch{}
  },[hydrated,library]);

  useEffect(()=>{
    if(!hydrated||target===null||finished)return;
    const snapshot:SavedDnaSession={mode,target,index,answers,finished:false,sessionSeed,updatedAt:Date.now()};
    setLibrary(prev=>({...prev,active:snapshot}));
  },[hydrated,mode,target,index,answers,finished,sessionSeed]);

  useEffect(()=>{
    if(!hydrated||target===null||!finished||answers.length<target)return;
    setLibrary(prev=>{
      const id=String(sessionSeed);
      if(prev.reports.some(report=>report.id===id))return{...prev,active:null};
      const completedAt=Date.now();
      const report:DnaReport={mode,target,index,answers,finished:true,sessionSeed,updatedAt:completedAt,id,completedAt,name:`ANÁLISE ${prev.reports.length+1} · ${mode}`,result:{label:result.label,scores:{...result.scores}}};
      return{active:null,reports:[report,...prev.reports]};
    });
  },[hydrated,target,finished,answers,mode,index,sessionSeed,result]);

  function start(depth:number){
    const seed=Date.now();
    setSelectedReportId(null);setHistoryOpen(false);setSessionSeed(seed);setTarget(depth);setIndex(0);setAnswers([]);setFinished(false);
  }

  function leave(){setTarget(null);setIndex(0);setAnswers([]);setFinished(false);setSelectedReportId(null)}

  function continueSaved(){
    const saved=library.active;if(!saved)return;
    setSelectedReportId(null);setHistoryOpen(false);setMode(saved.mode);setTarget(saved.target);setIndex(Math.min(saved.index,Math.max(0,saved.target-1)));setAnswers(saved.answers);setFinished(false);setSessionSeed(saved.sessionSeed);
  }

  function resetAll(){
    try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_STORAGE_KEY)}catch{}
    setLibrary(emptyLibrary);setSelectedReportId(null);setHistoryOpen(false);setEditingId(null);setTarget(null);setIndex(0);setAnswers([]);setFinished(false);setSessionSeed(1);
  }

  function answer(action:PlayerAction){
    if(!spot||!target)return;
    const next=[...answers,{spotId:spot.id,action}];setAnswers(next);
    if(next.length>=target){setFinished(true);return}
    setIndex(v=>v+1);
  }

  function beginRename(report:DnaReport){setEditingId(report.id);setEditingName(report.name)}
  function saveRename(){
    const name=editingName.trim();if(!editingId||!name)return;
    setLibrary(prev=>({...prev,reports:prev.reports.map(report=>report.id===editingId?{...report,name}:report)}));setEditingId(null);setEditingName("");
  }
  function deleteReport(id:string){
    setLibrary(prev=>({...prev,reports:prev.reports.filter(report=>report.id!==id)}));if(selectedReportId===id)setSelectedReportId(null);
  }

  if(selectedReport)return <ReportView report={selectedReport} onBack={()=>setSelectedReportId(null)} onRename={()=>beginRename(selectedReport)}/>;

  if(target===null)return <div className={styles.setup}>
    <div><div className="eyebrow">PLAYER DNA</div><h2>DESCUBRA SEU PERFIL</h2><p>Escolha a modalidade e a profundidade da análise. Seu progresso e seus relatórios ficam salvos neste dispositivo.</p></div>

    {library.active&&<div style={{border:"1px solid rgba(92,187,126,.28)",borderRadius:16,padding:16,background:"rgba(9,31,18,.62)",display:"grid",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}>
        <div><div className="eyebrow">ANÁLISE SALVA</div><strong style={{display:"block",marginTop:4}}>{library.active.mode} · {library.active.answers.length} / {library.active.target} SPOTS</strong><small style={{opacity:.65}}>CONTINUE EXATAMENTE DO PONTO EM QUE PAROU</small></div>
        <strong>{Math.round((Math.min(library.active.answers.length,library.active.target)/library.active.target)*100)}%</strong>
      </div>
      <div className={styles.track}><i style={{width:`${(Math.min(library.active.answers.length,library.active.target)/library.active.target)*100}%`}}/></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="primary" onClick={continueSaved}>CONTINUAR ANÁLISE</button></div>
    </div>}

    <div className={styles.modeGrid}>
      <button className={`${styles.modeButton} ${mode==="CASH"?styles.modeButtonActive:""}`} onClick={()=>setMode("CASH")}><strong>CASH</strong><small>JOGO A DINHEIRO</small></button>
      <button className={`${styles.modeButton} ${mode==="TORNEIO"?styles.modeButtonActive:""}`} onClick={()=>setMode("TORNEIO")}><strong>TORNEIO</strong><small>STACKS, ANTES E ICM</small></button>
    </div>
    <div className={styles.depthGrid}>{depths.map(n=><button key={n} onClick={()=>start(n)}><strong>{n}</strong><span>SPOTS</span></button>)}</div>

    <div style={{border:"1px solid rgba(92,187,126,.22)",borderRadius:16,padding:16,background:"rgba(5,20,12,.7)",display:"grid",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><div className="eyebrow">RELATÓRIOS E HISTÓRICO</div><strong style={{display:"block",marginTop:4}}>{library.reports.length} {library.reports.length===1?"ANÁLISE CONCLUÍDA":"ANÁLISES CONCLUÍDAS"}</strong><small style={{opacity:.65}}>ACESSE RESULTADOS FINAIS, DATAS E NOMES DAS SUAS ANÁLISES.</small></div><button className={styles.modeButton} style={{minHeight:44}} onClick={()=>setHistoryOpen(v=>!v)}><strong>{historyOpen?"FECHAR":"ABRIR HISTÓRICO"}</strong></button></div>
      {historyOpen&&<div style={{display:"grid",gap:10}}>{library.reports.length===0?<small style={{opacity:.58}}>NENHUM RELATÓRIO CONCLUÍDO AINDA.</small>:library.reports.map(report=><div key={report.id} style={{border:"1px solid rgba(92,187,126,.16)",borderRadius:12,padding:12,display:"grid",gap:10}}>
        {editingId===report.id?<div style={{display:"flex",gap:8,flexWrap:"wrap"}}><input value={editingName} onChange={e=>setEditingName(e.target.value)} maxLength={60} style={{flex:"1 1 220px",minHeight:42,borderRadius:9,border:"1px solid rgba(92,187,126,.25)",background:"#061009",color:"#e8f5ec",padding:"0 12px"}}/><button className="primary" onClick={saveRename}>SALVAR NOME</button><button className={styles.modeButton} onClick={()=>setEditingId(null)}><strong>CANCELAR</strong></button></div>:<div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><strong>{report.name}</strong><small style={{display:"block",opacity:.62,marginTop:4}}>{report.mode} · {report.target} SPOTS · {new Date(report.completedAt).toLocaleDateString("pt-BR")} · {report.result.label}</small></div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}><button className="primary" onClick={()=>setSelectedReportId(report.id)}>VER RELATÓRIO</button><button className={styles.modeButton} onClick={()=>beginRename(report)}><strong>EDITAR NOME</strong></button><button className={styles.modeButton} onClick={()=>deleteReport(report.id)}><strong>EXCLUIR</strong></button></div></div>}
      </div>)}</div>}
      <div style={{display:"flex",justifyContent:"flex-end"}}><button className={styles.modeButton} style={{minHeight:44}} onClick={resetAll}><strong>ZERAR TUDO</strong></button></div>
    </div>
  </div>;

  if(finished)return <div className={styles.result}>
    <div><span className="tag">PLAYER DNA · {mode}</span><h3>{result.label}</h3><p>{answers.length} / {target} SPOTS CONCLUÍDOS · RELATÓRIO SALVO NO HISTÓRICO</p></div>
    <div className={styles.resultGrid}><Metric label="AGRESSÃO" value={`${result.scores.aggression}%`}/><Metric label="DISCIPLINA" value={`${result.scores.discipline}%`}/><Metric label="PRESSÃO" value={`${result.scores.pressure}%`}/><Metric label="PASSIVIDADE" value={`${result.scores.passivity}%`}/></div>
    <button className="primary" onClick={leave}>VOLTAR AOS RELATÓRIOS</button>
  </div>;

  if(!spot)return <div className={styles.result}><h3>DADOS INSUFICIENTES</h3><button className="primary" onClick={leave}>VOLTAR</button></div>;

  return <div className={styles.session}>
    <div className={styles.progressHead}><span>SPOT {answers.length+1} / {target}</span><strong>{Math.round((answers.length/target)*100)}%</strong></div>
    <div className={styles.track}><i style={{width:`${(answers.length/target)*100}%`}}/></div>
    <Board spot={spot}/><Pot spot={spot}/><Players spot={spot}/><p className={styles.prompt}>QUAL A SUA AÇÃO?</p>
    <div className={styles.actions}>{spot.actions.map(action=><button key={action} onClick={()=>answer(action)}>{action}</button>)}</div><Scenario spot={spot}/>
    <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginTop:12}}><button className={styles.modeButton} style={{minHeight:44}} onClick={leave}><strong>SALVAR ANÁLISE E SAIR</strong></button></div>
  </div>;
}

function ReportView({report,onBack,onRename}:{report:DnaReport;onBack:()=>void;onRename:()=>void}){return <div className={styles.result}><div><span className="tag">RELATÓRIO PLAYER DNA · {report.mode}</span><h3>{report.name}</h3><p>{new Date(report.completedAt).toLocaleString("pt-BR")} · {report.answers.length} / {report.target} SPOTS</p></div><div className={styles.resultGrid}><Metric label="AGRESSÃO" value={`${report.result.scores.aggression}%`}/><Metric label="DISCIPLINA" value={`${report.result.scores.discipline}%`}/><Metric label="PRESSÃO" value={`${report.result.scores.pressure}%`}/><Metric label="PASSIVIDADE" value={`${report.result.scores.passivity}%`}/></div><div style={{border:"1px solid rgba(92,187,126,.2)",borderRadius:14,padding:14}}><small style={{opacity:.62}}>CLASSIFICAÇÃO FINAL</small><strong style={{display:"block",marginTop:5}}>{report.result.label}</strong></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="primary" onClick={onBack}>VOLTAR AO HISTÓRICO</button><button className={styles.modeButton} style={{minHeight:44}} onClick={onRename}><strong>EDITAR NOME</strong></button></div></div>}
function Board({spot}:{spot:PlayerDnaSpot}){const cards=spot.board?.split(" ").filter(Boolean)??[];return <section className={styles.block}><h4 className={styles.blockTitle}>BOARD</h4><div className={styles.boardRow}><span className={styles.badge}>{spot.street}</span>{cards.length>0&&<div className={styles.cards}>{cards.map(card=><span className={styles.card} key={card}>{card}</span>)}</div>}</div></section>}
function Pot({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>POT</h4><div className={styles.potRows}><div className={styles.potRow}><span className={styles.badge}>MAIN</span><span className={styles.potValue}>{fmt(spot.pot.main,spot.mode)}</span><span className={styles.participants}>{spot.players.map(p=>p.position).join(" · ")}</span></div>{spot.pot.sides?.map((side,i)=><div className={styles.potRow} key={i}><span className={styles.badge}>SIDE {i+1}</span><span className={styles.potValue}>{fmt(side.value,spot.mode)}</span><span className={styles.participants}>{side.players.join(" · ")}</span></div>)}</div></section>}
function Players({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>JOGADORES</h4><div className={styles.players}>{spot.players.map(player=><div className={`${styles.playerRow} ${player.hero?styles.hero:""}`} key={player.position}><Cell label="POSIÇÃO"><span className={styles.badge}>{player.position}</span></Cell><Cell label="CARTAS">{player.hero?<div className={styles.cards}>{spot.heroCards.split(" ").map(card=><span className={styles.card} key={card}>{card}</span>)}</div>:<div className={styles.closedCards}><span className={styles.closed}/><span className={styles.closed}/></div>}</Cell><Cell label="STACK"><span className={styles.value}>{fmt(player.stack,spot.mode)}</span></Cell><Cell label="AÇÃO"><span className={styles.value}>{player.hero?"---":player.action}</span></Cell><Cell label="VALOR"><span className={styles.value}>{player.hero?"---":player.value===0?"---":fmt(player.value,spot.mode)}</span></Cell></div>)}</div></section>}
function Scenario({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>CENÁRIO</h4><div className={styles.scenario}>{spot.scenario.map(item=><span className={styles.badge} key={item}>{item}</span>)}</div></section>}
function Cell({label,children}:{label:string;children:ReactNode}){return <div className={styles.cell}><span className={styles.label}>{label}</span>{children}</div>}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><small>{label}</small><strong>{value}</strong></div>}
function fmt(value:number,mode:GameMode){return mode==="TORNEIO"?`${trim(value)} BB`:`${Math.round(value)}K`}
function trim(value:number){return Number.isInteger(value)?String(value):value.toFixed(1)}