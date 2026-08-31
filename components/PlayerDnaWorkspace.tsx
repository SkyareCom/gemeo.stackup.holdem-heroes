"use client";

import {useEffect,useMemo,useState} from "react";
import {evaluatePlayerDna,type PlayerDnaAnswer} from "@/lib/player-dna";
import {buildBalancedSpotSession} from "@/lib/player-dna-sampler";
import {playerDnaSpots,type GameMode,type PlayerAction,type PlayerDnaSpot} from "@/data/player-dna-spots";
import styles from "./PlayerDnaWorkspace.module.css";

const depths=[100,250,500,1000,1500,3000] as const;
const STORAGE_KEY="stackup.player-dna.library.v2";
const LEGACY_STORAGE_KEY="stackup.player-dna.session.v1";

type SavedDnaSession={mode:GameMode;target:number;index:number;answers:PlayerDnaAnswer[];finished:boolean;sessionSeed:number;updatedAt:number};
type DnaScores={aggression:number;discipline:number;pressure:number;passivity:number};
type DnaReport=SavedDnaSession&{id:string;name:string;completedAt:number;result:{label:string;scores:DnaScores}};
type DnaLibrary={active:SavedDnaSession|null;reports:DnaReport[]};

const emptyLibrary:DnaLibrary={active:null,reports:[]};

export default function PlayerDnaWorkspace(){
  const[mode,setMode]=useState<GameMode>("CASH");
  const[target,setTarget]=useState<number|null>(null);
  const[selectedDepth,setSelectedDepth]=useState<number|null>(null);
  const[index,setIndex]=useState(0);
  const[answers,setAnswers]=useState<PlayerDnaAnswer[]>([]);
  const[selectedAction,setSelectedAction]=useState<PlayerAction|null>(null);
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
  const result=useMemo(()=>finished?evaluatePlayerDna(session,answers):null,[finished,session,answers]);
  const selectedReport=library.reports.find(report=>report.id===selectedReportId)??null;

  useEffect(()=>{
    let next:DnaLibrary=emptyLibrary;
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){const parsed=JSON.parse(raw) as DnaLibrary;if(parsed&&Array.isArray(parsed.reports))next={active:parsed.active??null,reports:parsed.reports}}
      else{const legacy=localStorage.getItem(LEGACY_STORAGE_KEY);if(legacy){const parsed=JSON.parse(legacy) as SavedDnaSession;if(parsed&&parsed.target>0&&Array.isArray(parsed.answers))next={active:parsed.finished?null:parsed,reports:[]}}}
    }catch{}
    setLibrary(next);setHydrated(true);
  },[]);

  useEffect(()=>{
    if(!hydrated)return;
    const timer=window.setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(library))}catch{}},120);
    return()=>window.clearTimeout(timer);
  },[hydrated,library]);

  useEffect(()=>{
    if(!hydrated||target===null||finished)return;
    const snapshot:SavedDnaSession={mode,target,index,answers,finished:false,sessionSeed,updatedAt:Date.now()};
    setLibrary(prev=>({...prev,active:snapshot}));
  },[hydrated,mode,target,index,answers,finished,sessionSeed]);

  useEffect(()=>{
    if(!hydrated||target===null||!finished||answers.length<target||!result)return;
    setLibrary(prev=>{
      const id=String(sessionSeed);
      if(prev.reports.some(report=>report.id===id))return{...prev,active:null};
      const completedAt=Date.now();
      const report:DnaReport={mode,target,index,answers,finished:true,sessionSeed,updatedAt:completedAt,id,completedAt,name:`ANÁLISE ${prev.reports.length+1} · ${mode}`,result:{label:result.label,scores:{...result.scores}}};
      return{active:null,reports:[report,...prev.reports]};
    });
  },[hydrated,target,finished,answers,mode,index,sessionSeed,result]);

  useEffect(()=>{
    const previous=()=>{
      if(editingId){setEditingId(null);setEditingName("");return}
      if(selectedReportId){setSelectedReportId(null);return}
      if(historyOpen){setHistoryOpen(false);return}
      if(target!==null||finished){leave();return}
      window.location.assign("/");
    };
    window.addEventListener("player-dna-previous",previous);
    return()=>window.removeEventListener("player-dna-previous",previous);
  },[editingId,selectedReportId,historyOpen,target,finished]);

  function start(depth:number){const selectedMode=(document.querySelector<HTMLInputElement>('input[name="player-dna-mode"]:checked')?.value as GameMode|undefined)??mode;const seed=Date.now();setSelectedDepth(depth);setMode(selectedMode);setSelectedReportId(null);setHistoryOpen(false);setSessionSeed(seed);setTarget(depth);setIndex(0);setAnswers([]);setSelectedAction(null);setFinished(false);window.requestAnimationFrame(()=>document.querySelector(".profile-panel")?.scrollIntoView({behavior:"smooth",block:"start"}))}
  function leave(){setTarget(null);setIndex(0);setAnswers([]);setSelectedAction(null);setFinished(false);setSelectedReportId(null)}
  function continueSaved(){const saved=library.active;if(!saved)return;setSelectedReportId(null);setHistoryOpen(false);setMode(saved.mode);setTarget(saved.target);setIndex(Math.min(saved.index,Math.max(0,saved.target-1)));setAnswers(saved.answers);setSelectedAction(null);setFinished(false);setSessionSeed(saved.sessionSeed)}
  function resetAll(){try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_STORAGE_KEY)}catch{}setLibrary(emptyLibrary);setSelectedReportId(null);setHistoryOpen(false);setEditingId(null);setTarget(null);setIndex(0);setAnswers([]);setSelectedAction(null);setFinished(false);setSessionSeed(1)}
  function chooseAction(action:PlayerAction){setSelectedAction(current=>current===action?null:action)}
  function nextSpot(){
    if(!spot||!target||!selectedAction)return;
    const answer:PlayerDnaAnswer={spotId:spot.id,action:selectedAction};
    const next=[...answers,answer];
    setAnswers(next);setSelectedAction(null);
    if(next.length>=target){setFinished(true);return}
    setIndex(v=>Math.min(v+1,target-1));
  }
  function beginRename(report:DnaReport){setEditingId(report.id);setEditingName(report.name)}
  function saveRename(){const name=editingName.trim();if(!editingId||!name)return;setLibrary(prev=>({...prev,reports:prev.reports.map(report=>report.id===editingId?{...report,name}:report)}));setEditingId(null);setEditingName("")}
  function deleteReport(id:string){setLibrary(prev=>({...prev,reports:prev.reports.filter(report=>report.id!==id)}));if(selectedReportId===id)setSelectedReportId(null)}

  if(selectedReport)return <ReportView report={selectedReport} onBack={()=>setSelectedReportId(null)} onRename={()=>beginRename(selectedReport)}/>;

  if(target===null)return <div className={styles.setup}>
    <div><div className="eyebrow">PLAYER DNA</div><h2>DESCUBRA SEU PERFIL</h2><p className="setup-intro">Escolha a modalidade e a profundidade da análise. Seu progresso e seus relatórios ficam salvos neste dispositivo.</p></div>
    <div className={`${styles.modeGrid} mode-choices`}>
      {(["CASH","TORNEIO"] as const).map(option=><label key={option} className={styles.modeButton}><input type="radio" name="player-dna-mode" value={option} defaultChecked={mode===option}/><strong>{option}</strong></label>)}
    </div>
    <div className={`${styles.depthGrid} depth-choices`}>{depths.map(n=><button type="button" key={n} aria-pressed={selectedDepth===n} onPointerDown={()=>setSelectedDepth(n)} onClick={()=>start(n)}><strong>{n}</strong><span>SPOTS</span></button>)}</div>
    <div className="saved-analysis-panel" style={{border:"1px solid rgba(92,187,126,.28)",borderRadius:16,padding:16,background:"rgba(9,31,18,.62)",display:"grid",gap:12}}>
      <div>
        <div className="eyebrow saved-analysis-title">ANÁLISE SALVA</div>
        {library.active?<>
          <strong className="saved-analysis-status" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,flexWrap:"nowrap",width:"100%",marginTop:4}}>
            <span>{library.active.mode} · {library.active.answers.length} / {library.active.target} SPOTS</span>
            <span style={{marginLeft:"auto",textAlign:"right"}}>{Math.round((Math.min(library.active.answers.length,library.active.target)/library.active.target)*100)}%</span>
          </strong>
          <small className="saved-analysis-description">CONTINUE EXATAMENTE DO PONTO EM QUE PAROU</small>
        </>:<>
          <strong className="saved-analysis-status" style={{display:"block",marginTop:4}}>NENHUMA ANÁLISE EM ANDAMENTO</strong>
          <small className="saved-analysis-description">ESCOLHA A MODALIDADE E O NÚMERO DE SPOTS PARA COMEÇAR.</small>
        </>}
      </div>
      {library.active&&<div className={styles.track}><i style={{width:`${(Math.min(library.active.answers.length,library.active.target)/library.active.target)*100}%`}}/></div>}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" className="primary" onClick={continueSaved} disabled={!library.active}>CONTINUAR ANÁLISE</button></div>
    </div>
    <div className="history-panel" style={{border:"1px solid rgba(92,187,126,.22)",borderRadius:16,padding:16,background:"rgba(5,20,12,.7)",display:"grid",gap:12}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><div className="eyebrow history-eyebrow">RELATÓRIOS E HISTÓRICO</div><strong className="history-count" style={{display:"block",marginTop:4}}>{library.reports.length} {library.reports.length===1?"ANÁLISE CONCLUÍDA":"ANÁLISES CONCLUÍDAS"}</strong><small className="history-description" style={{opacity:.65}}>ACESSE RESULTADOS FINAIS, DATAS E NOMES DAS SUAS ANÁLISES.</small></div><div className="history-actions"><button type="button" aria-expanded={historyOpen} className={`${styles.modeButton} history-action`} onClick={()=>setHistoryOpen(v=>!v)}><strong>{historyOpen?"FECHAR":"ABRIR HISTÓRICO"}</strong></button><button type="button" className={`${styles.modeButton} history-action`} onClick={resetAll}><strong>ZERAR HISTÓRICO</strong></button></div></div>
      {historyOpen&&<div style={{display:"grid",gap:10}}>{library.reports.length===0?<small style={{opacity:.58}}>NENHUM RELATÓRIO CONCLUÍDO AINDA.</small>:library.reports.map(report=><div key={report.id} style={{border:"1px solid rgba(92,187,126,.16)",borderRadius:12,padding:12,display:"grid",gap:10}}>{editingId===report.id?<div style={{display:"flex",gap:8,flexWrap:"wrap"}}><input value={editingName} onChange={e=>setEditingName(e.target.value)} maxLength={60} style={{flex:"1 1 220px",minHeight:42,borderRadius:9,border:"1px solid rgba(92,187,126,.25)",background:"#061009",color:"#e8f5ec",padding:"0 12px"}}/><button type="button" className="primary" onClick={saveRename} disabled={!editingName.trim()}>SALVAR NOME</button><button type="button" className={styles.modeButton} onClick={()=>{setEditingId(null);setEditingName("")}}><strong>CANCELAR</strong></button></div>:<div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><strong>{report.name}</strong><small style={{display:"block",opacity:.62,marginTop:4}}>{report.mode} · {report.target} SPOTS · {new Date(report.completedAt).toLocaleDateString("pt-BR")} · {report.result.label}</small></div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}><button type="button" className="primary" onClick={()=>setSelectedReportId(report.id)}>VER RELATÓRIO</button><button type="button" className={styles.modeButton} onClick={()=>beginRename(report)}><strong>EDITAR NOME</strong></button><button type="button" className={styles.modeButton} onClick={()=>deleteReport(report.id)}><strong>EXCLUIR</strong></button></div></div>}</div>)}</div>}
    </div>
  </div>;

  if(finished&&result)return <div className={styles.result}><div><span className="tag">PLAYER DNA · {mode}</span><h3>{result.label}</h3><p>{answers.length} / {target} SPOTS CONCLUÍDOS · RELATÓRIO SALVO NO HISTÓRICO</p></div><div className={styles.resultGrid}><Metric label="AGRESSÃO" value={`${result.scores.aggression}%`}/><Metric label="DISCIPLINA" value={`${result.scores.discipline}%`}/><Metric label="PRESSÃO" value={`${result.scores.pressure}%`}/><Metric label="PASSIVIDADE" value={`${result.scores.passivity}%`}/></div><button type="button" className="primary" onClick={leave}>VOLTAR AOS RELATÓRIOS</button></div>;
  if(!spot)return <div className={styles.result}><h3>DADOS INSUFICIENTES</h3><button type="button" className="primary" onClick={leave}>VOLTAR</button></div>;

  return <div className={`${styles.session} training-session`}><div className={styles.progressHead}><span>SPOT {answers.length+1} / {target}</span><strong>{Math.round((answers.length/target)*100)}%</strong></div><div className={styles.track}><i style={{width:`${(answers.length/target)*100}%`}}/></div><Level spot={spot}/><Board spot={spot}/><Pot spot={spot}/><Players spot={spot}/><p className={styles.prompt}>QUAL A SUA AÇÃO?</p><div className={styles.actions}>{spot.actions.map(action=><button type="button" aria-pressed={selectedAction===action} className={selectedAction===action?styles.actionSelected:""} key={action} onClick={()=>chooseAction(action)}>{action}</button>)}</div><Scenario spot={spot}/><div className="training-footer" style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginTop:12}}><button type="button" className={styles.modeButton} onClick={leave}><strong>SALVAR ANÁLISE E SAIR</strong></button><button type="button" className="primary" aria-disabled={!selectedAction} onClick={nextSpot}>PRÓXIMO</button></div></div>;
}

function ReportView({report,onBack,onRename}:{report:DnaReport;onBack:()=>void;onRename:()=>void}){return <div className={styles.result}><div><span className="tag">RELATÓRIO PLAYER DNA · {report.mode}</span><h3>{report.name}</h3><p>{new Date(report.completedAt).toLocaleString("pt-BR")} · {report.answers.length} / {report.target} SPOTS</p></div><div className={styles.resultGrid}><Metric label="AGRESSÃO" value={`${report.result.scores.aggression}%`}/><Metric label="DISCIPLINA" value={`${report.result.scores.discipline}%`}/><Metric label="PRESSÃO" value={`${report.result.scores.pressure}%`}/><Metric label="PASSIVIDADE" value={`${report.result.scores.passivity}%`}/></div><div style={{border:"1px solid rgba(92,187,126,.2)",borderRadius:14,padding:14}}><small style={{opacity:.62}}>CLASSIFICAÇÃO FINAL</small><strong style={{display:"block",marginTop:5}}>{report.result.label}</strong></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" className="primary" onClick={onBack}>VOLTAR AO HISTÓRICO</button><button type="button" className={styles.modeButton} style={{minHeight:44}} onClick={onRename}><strong>EDITAR NOME</strong></button></div></div>}
function Board({spot}:{spot:PlayerDnaSpot}){const cards=spot.board?.split(" ").filter(Boolean)??[];return <section className={styles.block}><h4 className={styles.blockTitle}>BOARD</h4><div className={styles.boardRow}><span className={styles.badge}>{spot.street}</span>{cards.length>0&&<div className={styles.cards}>{cards.map(card=><span className={styles.card} key={card}>{card}</span>)}</div>}</div></section>}
function Pot({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>POT</h4><div className={styles.potRows}><div className={styles.potRow}><span className={styles.badge}>MAIN</span><span className={styles.potValue}>{fmt(spot.pot.main,spot.mode)}</span><span className={styles.participants}>{spot.players.map(p=>p.position).join(" · ")}</span></div>{spot.pot.sides?.map((side,i)=><div className={styles.potRow} key={i}><span className={styles.badge}>SIDE {i+1}</span><span className={styles.potValue}>{fmt(side.value,spot.mode)}</span><span className={styles.participants}>{side.players.join(" · ")}</span></div>)}</div></section>}
function Level({spot}:{spot:PlayerDnaSpot}){
  const phase=spot.scenario.find(item=>["EARLY GAME","MID GAME","BOLHA","ITM","FT"].includes(item))??(spot.mode==="CASH"?"CASH":"TORNEIO");
  const tournamentLevels:Record<string,{sb:string;bb:string;ante:string}>={"EARLY GAME":{sb:"100",bb:"200",ante:"20"},"MID GAME":{sb:"500",bb:"1.000",ante:"100"},BOLHA:{sb:"1.000",bb:"2.000",ante:"200"},ITM:{sb:"1.500",bb:"3.000",ante:"300"},FT:{sb:"2.500",bb:"5.000",ante:"500"}};
  const level=tournamentLevels[phase]??{sb:"0,5 BB",bb:"1 BB",ante:""};
  return <section className={`${styles.block} ${styles.levelCard}`}><div className={styles.levelTitle}><h4 className={styles.blockTitle}>NÍVEL</h4><span className={styles.badge}>{phase}</span></div><div className={styles.levelValues}><div><span>SB</span><strong>{level.sb}</strong></div><div><span>BB</span><strong>{level.bb}</strong></div>{spot.mode==="TORNEIO"&&<div><span>ANTE</span><strong>{level.ante}</strong></div>}</div></section>
}

type ActionLine={id:string;street:PlayerDnaSpot["street"];position:string;action:string;stack:number;fold?:boolean};
const streetOrder:PlayerDnaSpot["street"][]=["PREFLOP","FLOP","TURN","RIVER"];
function actionLines(spot:PlayerDnaSpot){
  const opponents=spot.players.filter(player=>!player.hero);
  const currentIndex=streetOrder.indexOf(spot.street);
  const previous:ActionLine[]=[];
  streetOrder.slice(0,currentIndex).forEach((street,streetIndex)=>{
    const player=opponents[streetIndex%Math.max(1,opponents.length)];
    if(player)previous.push({id:`${spot.id}-${street}-history`,street,position:player.position,action:street==="PREFLOP"?"RAISE":"BET",stack:player.stack});
  });
  const current=opponents.map((player,index)=>({id:`${spot.id}-${spot.street}-${player.position}-${index}`,street:spot.street,position:player.position,action:player.action,stack:player.stack,fold:player.action==="FOLD"}));
  return{previous,current};
}

function Players({spot}:{spot:PlayerDnaSpot}){
  const flow=useMemo(()=>actionLines(spot),[spot]);
  const[visible,setVisible]=useState<ActionLine[]>(flow.previous);
  useEffect(()=>{
    setVisible(flow.previous);
    const timers:number[]=[];
    flow.current.forEach((line,index)=>{
      timers.push(window.setTimeout(()=>{
        setVisible(rows=>[...rows,line]);
        if(line.fold)timers.push(window.setTimeout(()=>setVisible(rows=>rows.filter(row=>row.id!==line.id)),1400));
      },index*1000));
    });
    return()=>timers.forEach(timer=>window.clearTimeout(timer));
  },[flow]);
  return <section className={`${styles.block} ${styles.actionsCard}`}><div className={styles.actionsCardTitle}><span className={styles.badge}>{spot.street}</span><h4>JOGADORES COM AÇÃO</h4></div><div className={styles.actionHistory}>{visible.map(line=><div className={`${styles.actionLine} ${line.fold?styles.foldLine:""}`} key={line.id}><span className={styles.badge}>{line.position}</span><span className={styles.actionBadge}>{line.street!==spot.street?`${line.street} · `:""}{line.action}</span><span className={styles.actionStack}>{fmt(line.stack,spot.mode)}</span></div>)}</div></section>
}
function Scenario({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>CENÁRIO</h4><div className={styles.scenario}>{spot.scenario.map(item=><span className={styles.badge} key={item}>{item}</span>)}</div></section>}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><small>{label}</small><strong>{value}</strong></div>}
function fmt(value:number,mode:GameMode){return mode==="TORNEIO"?`${trim(value)} BB`:`${Math.round(value)}K`}
function trim(value:number){return Number.isInteger(value)?String(value):value.toFixed(1)}
