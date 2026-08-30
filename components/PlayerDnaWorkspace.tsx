"use client";

import {useEffect,useMemo,useState,type ChangeEvent,type ReactNode} from "react";
import {evaluatePlayerDna,type PlayerDnaAnswer} from "@/lib/player-dna";
import {buildBalancedSpotSession} from "@/lib/player-dna-sampler";
import {buildPlayerDevelopmentReport,reportToStandaloneHtml,type DnaChecklistItem,type DnaDevelopmentReport} from "@/lib/player-dna-report";
import {buildPlayerDnaExchange,parsePlayerDnaExchange,type ImportedTrainingBundle} from "@/lib/player-dna-exchange";
import {playerDnaSpots,type GameMode,type PlayerAction,type PlayerDnaSpot} from "@/data/player-dna-spots";
import styles from "./PlayerDnaWorkspace.module.css";

const depths=[100,250,500,1000,1500,3000] as const;
const STORAGE_KEY="stackup.player-dna.library.v3";
const OLD_STORAGE_KEY="stackup.player-dna.library.v2";
const LEGACY_STORAGE_KEY="stackup.player-dna.session.v1";
const EXCHANGE_INBOX_KEY="stackup.exchange.inbox.v1";

type SavedDnaSession={mode:GameMode;target:number;index:number;answers:PlayerDnaAnswer[];finished:boolean;sessionSeed:number;updatedAt:number;name:string;createdAt:number};
type DnaScores={aggression:number;discipline:number;pressure:number;passivity:number};
type DnaReport=SavedDnaSession&{id:string;completedAt:number;result:{label:string;scores:DnaScores};development:DnaDevelopmentReport};
type DnaLibrary={active:SavedDnaSession|null;reports:DnaReport[]};
const emptyLibrary:DnaLibrary={active:null,reports:[]};

export default function PlayerDnaWorkspace(){
  const[mode,setMode]=useState<GameMode>("CASH");
  const[target,setTarget]=useState<number|null>(null);
  const[index,setIndex]=useState(0);
  const[answers,setAnswers]=useState<PlayerDnaAnswer[]>([]);
  const[finished,setFinished]=useState(false);
  const[sessionSeed,setSessionSeed]=useState(1);
  const[sessionName,setSessionName]=useState("");
  const[createdAt,setCreatedAt]=useState(0);
  const[library,setLibrary]=useState<DnaLibrary>(emptyLibrary);
  const[inbox,setInbox]=useState<ImportedTrainingBundle|null>(null);
  const[exchangeMessage,setExchangeMessage]=useState("");
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
      const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem(OLD_STORAGE_KEY);
      if(raw){const parsed=JSON.parse(raw) as Partial<DnaLibrary>;const reports=(parsed.reports??[]).map((report:any)=>migrateReport(report));const active=parsed.active?migrateSession(parsed.active,reports.length+1):null;next={active,reports}}
      else{const legacy=localStorage.getItem(LEGACY_STORAGE_KEY);if(legacy){const parsed=JSON.parse(legacy);next={active:parsed.finished?null:migrateSession(parsed,1),reports:[]}}}
      const exchangeRaw=localStorage.getItem(EXCHANGE_INBOX_KEY);if(exchangeRaw)setInbox(parsePlayerDnaExchange(exchangeRaw));
    }catch{}
    setLibrary(next);setHydrated(true);
  },[]);

  useEffect(()=>{if(hydrated)try{localStorage.setItem(STORAGE_KEY,JSON.stringify(library))}catch{}},[hydrated,library]);
  useEffect(()=>{if(!hydrated||target===null||finished)return;const snapshot:SavedDnaSession={mode,target,index,answers,finished:false,sessionSeed,updatedAt:Date.now(),name:sessionName||`ANÁLISE · ${mode}`,createdAt:createdAt||Date.now()};setLibrary(prev=>({...prev,active:snapshot}))},[hydrated,mode,target,index,answers,finished,sessionSeed,sessionName,createdAt]);
  useEffect(()=>{if(!hydrated||target===null||!finished||answers.length<target)return;setLibrary(prev=>{const id=String(sessionSeed);if(prev.reports.some(report=>report.id===id))return{...prev,active:null};const completedAt=Date.now();const development=buildPlayerDevelopmentReport(mode,session,answers,result);const report:DnaReport={mode,target,index,answers,finished:true,sessionSeed,updatedAt:completedAt,id,completedAt,name:sessionName||`ANÁLISE ${prev.reports.length+1} · ${mode}`,createdAt:createdAt||completedAt,result:{label:result.label,scores:{...result.scores}},development};return{active:null,reports:[report,...prev.reports]}})},[hydrated,target,finished,answers,mode,index,sessionSeed,result,session,sessionName,createdAt]);

  function start(depth:number){const seed=Date.now();setSelectedReportId(null);setHistoryOpen(false);setSessionSeed(seed);setSessionName(`ANÁLISE ${library.reports.length+1} · ${mode}`);setCreatedAt(seed);setTarget(depth);setIndex(0);setAnswers([]);setFinished(false)}
  function leave(openHistory=false){setTarget(null);setIndex(0);setAnswers([]);setFinished(false);setSelectedReportId(null);setHistoryOpen(openHistory)}
  function continueSaved(){const saved=library.active;if(!saved)return;setSelectedReportId(null);setHistoryOpen(false);setMode(saved.mode);setTarget(saved.target);setIndex(Math.min(saved.index,Math.max(0,saved.target-1)));setAnswers(saved.answers);setFinished(false);setSessionSeed(saved.sessionSeed);setSessionName(saved.name);setCreatedAt(saved.createdAt)}
  function resetAll(){try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(OLD_STORAGE_KEY);localStorage.removeItem(LEGACY_STORAGE_KEY);localStorage.removeItem(EXCHANGE_INBOX_KEY)}catch{}setLibrary(emptyLibrary);setInbox(null);setExchangeMessage("");setSelectedReportId(null);setHistoryOpen(false);setEditingId(null);setTarget(null);setIndex(0);setAnswers([]);setFinished(false);setSessionSeed(1)}
  function answer(action:PlayerAction){if(!spot||!target)return;const next=[...answers,{spotId:spot.id,action}];setAnswers(next);if(next.length>=target){setFinished(true);return}setIndex(v=>v+1)}
  function beginRename(report:DnaReport){setEditingId(report.id);setEditingName(report.name)}
  function saveRename(){const name=editingName.trim();if(!editingId||!name)return;setLibrary(prev=>({...prev,reports:prev.reports.map(report=>report.id===editingId?{...report,name}:report)}));setEditingId(null);setEditingName("")}
  function deleteReport(id:string){setLibrary(prev=>({...prev,reports:prev.reports.filter(report=>report.id!==id)}));if(selectedReportId===id)setSelectedReportId(null)}
  function updateChecklist(reportId:string,itemId:string,patch:Partial<DnaChecklistItem>){setLibrary(prev=>({...prev,reports:prev.reports.map(report=>report.id===reportId?{...report,development:{...report.development,checklist:report.development.checklist.map(item=>item.id===itemId?{...item,...patch}:item)}}:report)}))}
  async function importExchange(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value="";if(!file)return;try{const text=await file.text();const parsed=parsePlayerDnaExchange(text);localStorage.setItem(EXCHANGE_INBOX_KEY,text);setInbox(parsed);setExchangeMessage(`IMPORTADO: ${parsed.spots.length} SPOTS · ${parsed.prescriptions.length} TREINOS · ${parsed.producer}`)}catch(error){setExchangeMessage(error instanceof Error?error.message:"Falha ao importar STACKUP EXCHANGE.")}}
  function clearExchange(){try{localStorage.removeItem(EXCHANGE_INBOX_KEY)}catch{}setInbox(null);setExchangeMessage("CAIXA DE INTEGRAÇÃO LIMPA")}

  if(selectedReport){const previous=library.reports.find(r=>r.id!==selectedReport.id&&r.mode===selectedReport.mode&&r.completedAt<selectedReport.completedAt)??null;return <ReportView report={selectedReport} previous={previous} onBack={()=>{setSelectedReportId(null);setHistoryOpen(true)}} onRename={()=>{beginRename(selectedReport);setSelectedReportId(null);setHistoryOpen(true)}} onChecklist={updateChecklist}/>}

  if(target===null)return <div className={styles.setup}>
    <div><div className="eyebrow">PLAYER DNA</div><h2>DESCUBRA SEU PERFIL</h2><p>Escolha a modalidade e a profundidade da análise. Seu progresso, relatórios e plano de evolução ficam salvos neste dispositivo.</p></div>

    {library.active&&<div className={styles.block}><div className={styles.progressHead}><span>ANÁLISE SALVA · {library.active.name}</span><strong>{Math.round(Math.min(library.active.answers.length,library.active.target)/library.active.target*100)}%</strong></div><div className={styles.track}><i style={{width:`${Math.min(library.active.answers.length,library.active.target)/library.active.target*100}%`}}/></div><small>{library.active.mode} · {library.active.answers.length} / {library.active.target} SPOTS</small><div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}><button type="button" className="primary" onClick={continueSaved}>CONTINUAR ANÁLISE</button></div></div>}

    <div className={styles.modeGrid}><button type="button" className={`${styles.modeButton} ${mode==="CASH"?styles.modeButtonActive:""}`} onClick={()=>setMode("CASH")}><strong>CASH</strong><small>JOGO A DINHEIRO</small></button><button type="button" className={`${styles.modeButton} ${mode==="TORNEIO"?styles.modeButtonActive:""}`} onClick={()=>setMode("TORNEIO")}><strong>TORNEIO</strong><small>STACKS, ANTES E ICM</small></button></div>
    <div className={styles.depthGrid}>{depths.map(n=><button type="button" key={n} onClick={()=>start(n)}><strong>{n}</strong><span>SPOTS</span></button>)}</div>

    <div className={styles.block}><div className={styles.progressHead}><span>STACKUP EXCHANGE</span><strong>{inbox?"CONECTADO":"PRONTO"}</strong></div><p>Importe spots e prescrições gerados por outro módulo/app Stackup. O arquivo fica armazenado localmente até a futura sincronização por API.</p>{inbox&&<div className={styles.resultGrid}><Metric label="SPOTS IMPORTADOS" value={String(inbox.spots.length)}/><Metric label="TREINOS RECEBIDOS" value={String(inbox.prescriptions.length)}/><Metric label="ORIGEM" value={inbox.producer}/><Metric label="EXPORTADO" value={new Date(inbox.exportedAt).toLocaleDateString("pt-BR")}/></div>}<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}><label className={styles.modeButton} style={{cursor:"pointer"}}><strong>IMPORTAR STACKUP EXCHANGE</strong><input type="file" accept="application/json,.json" onChange={importExchange} style={{display:"none"}}/></label>{inbox&&<button type="button" className={styles.modeButton} onClick={clearExchange}><strong>LIMPAR IMPORTAÇÃO</strong></button>}</div>{exchangeMessage&&<small style={{display:"block",marginTop:8}}>{exchangeMessage}</small>}</div>

    <div className={styles.block}><div className={styles.progressHead}><span>ANÁLISES & EVOLUÇÃO</span><strong>{library.reports.length}</strong></div><button type="button" className={styles.modeButton} onClick={()=>setHistoryOpen(v=>!v)}><strong>{historyOpen?"FECHAR":"ABRIR HISTÓRICO"}</strong></button>{historyOpen&&<div style={{display:"grid",gap:8,marginTop:8}}>{library.reports.length===0?<small>NENHUM RELATÓRIO CONCLUÍDO AINDA.</small>:library.reports.map(report=><div key={report.id} className={styles.block}>{editingId===report.id?<div style={{display:"flex",gap:8,flexWrap:"wrap"}}><input value={editingName} onChange={e=>setEditingName(e.target.value)} maxLength={60}/><button type="button" className="primary" onClick={saveRename}>SALVAR NOME</button><button type="button" className={styles.modeButton} onClick={()=>setEditingId(null)}><strong>CANCELAR</strong></button></div>:<><strong>{report.name}</strong><small>{report.mode} · {report.target} SPOTS · {new Date(report.completedAt).toLocaleDateString("pt-BR")} · {report.result.label} · CONFIANÇA {report.development.confidence}%</small><div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:8}}><button type="button" className="primary" onClick={()=>setSelectedReportId(report.id)}>ABRIR ANÁLISE</button><button type="button" className={styles.modeButton} onClick={()=>beginRename(report)}><strong>EDITAR NOME</strong></button><button type="button" className={styles.modeButton} onClick={()=>deleteReport(report.id)}><strong>EXCLUIR</strong></button></div></>}</div>)}</div>}<div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}><button type="button" className={styles.modeButton} onClick={resetAll}><strong>ZERAR TUDO</strong></button></div></div>
  </div>;

  if(finished)return <div className={styles.result}><div><span className="tag">PLAYER DNA · {mode}</span><h3>{result.label}</h3><p>{answers.length} / {target} SPOTS CONCLUÍDOS · ANÁLISE SALVA NO HISTÓRICO</p></div><div className={styles.resultGrid}><Metric label="AGRESSÃO" value={`${result.scores.aggression}%`}/><Metric label="DISCIPLINA" value={`${result.scores.discipline}%`}/><Metric label="PRESSÃO" value={`${result.scores.pressure}%`}/><Metric label="PASSIVIDADE" value={`${result.scores.passivity}%`}/></div><button type="button" className="primary" onClick={()=>leave(true)}>VOLTAR ÀS ANÁLISES</button></div>;
  if(!spot)return <div className={styles.result}><h3>DADOS INSUFICIENTES</h3><button type="button" className="primary" onClick={()=>leave(false)}>VOLTAR</button></div>;
  return <div className={styles.session}><div className={styles.progressHead}><span>SPOT {answers.length+1} / {target}</span><strong>{Math.round(answers.length/target*100)}%</strong></div><div className={styles.track}><i style={{width:`${answers.length/target*100}%`}}/></div><Board spot={spot}/><Pot spot={spot}/><Players spot={spot}/><p className={styles.prompt}>QUAL A SUA AÇÃO?</p><div className={styles.actions}>{spot.actions.map(action=><button type="button" key={action} onClick={()=>answer(action)}>{action}</button>)}</div><Scenario spot={spot}/><div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginTop:12}}><button type="button" className={styles.modeButton} onClick={()=>leave(false)}><strong>SALVAR ANÁLISE E SAIR</strong></button></div></div>;
}

function ReportView({report,previous,onBack,onRename,onChecklist}:{report:DnaReport;previous:DnaReport|null;onBack:()=>void;onRename:()=>void;onChecklist:(reportId:string,itemId:string,patch:Partial<DnaChecklistItem>)=>void}){
  const completed=report.development.checklist.filter(i=>i.status==="CONCLUÍDO").length;
  const deltas=previous?{aggression:report.result.scores.aggression-previous.result.scores.aggression,discipline:report.result.scores.discipline-previous.result.scores.discipline,pressure:report.result.scores.pressure-previous.result.scores.pressure,passivity:report.result.scores.passivity-previous.result.scores.passivity}:null;
  const reportSpots=buildBalancedSpotSession(playerDnaSpots,report.mode,report.target,report.sessionSeed);
  function saveBlob(content:string,type:string,filename:string){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)}
  function download(){saveBlob(reportToStandaloneHtml(report.name,report.mode,report.completedAt,report.result.scores,report.development),"text/html;charset=utf-8",`${safeName(report.name)}.html`)}
  function downloadJson(){saveBlob(JSON.stringify(report,null,2),"application/json",`${safeName(report.name)}.json`)}
  function downloadExchange(){const exchange=buildPlayerDnaExchange({reportId:report.id,reportName:report.name,mode:report.mode,completedAt:report.completedAt,answers:report.answers,spots:reportSpots,development:report.development});saveBlob(JSON.stringify(exchange,null,2),"application/json",`${safeName(report.name)}_stackup-exchange.json`)}
  function whatsapp(){const tasks=report.development.checklist.filter(i=>i.status!=="CONCLUÍDO").slice(0,5).map(i=>`• ${i.title}`).join("\n");const text=`STACKUP PLAYER DNA — ${report.name}\nPerfil: ${report.development.archetype}\nConfiança: ${report.development.confidence}%\nEvolution Score: ${report.development.evolutionScore}/100\n\nPróximos treinos:\n${tasks}`;window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank","noopener,noreferrer")}
  return <div className={styles.result}><div><span className="tag">PLAYER DEVELOPMENT REPORT · {report.mode}</span><h3>{report.name}</h3><p>{new Date(report.completedAt).toLocaleString("pt-BR")} · {report.answers.length} / {report.target} SPOTS</p></div><div className={styles.resultGrid}><Metric label="AGRESSÃO" value={`${report.result.scores.aggression}%`}/><Metric label="DISCIPLINA" value={`${report.result.scores.discipline}%`}/><Metric label="PRESSÃO" value={`${report.result.scores.pressure}%`}/><Metric label="PASSIVIDADE" value={`${report.result.scores.passivity}%`}/></div>
    <ReportSection title="IDENTIDADE DO JOGADOR"><p><strong>{report.development.archetype}</strong> · {report.development.secondaryArchetype}</p><p>EVOLUTION SCORE: <strong>{report.development.evolutionScore}/100</strong></p></ReportSection>
    <ReportSection title="CONFIABILIDADE"><p><strong>{report.development.confidence}% · {report.development.confidenceLabel}</strong></p><p>{report.development.confidenceReason}</p></ReportSection>
    <ReportSection title="ESTATÍSTICAS DE AÇÃO"><div className={styles.resultGrid}>{Object.entries(report.development.actionStats).filter(([,v])=>v>0).map(([action,count])=><Metric key={action} label={action} value={`${count} · ${Math.round(count/report.answers.length*100)}%`}/>)}</div></ReportSection>
    <ReportSection title="EVIDÊNCIAS"><div style={{display:"grid",gap:8}}>{report.development.evidences.map(e=><div className={styles.block} key={e.label}><strong>{e.label}</strong><small>{e.explanation}</small><small>SPOTS: {e.spotIds.join(" · ")}</small></div>)}</div></ReportSection>
    <ReportSection title="FORÇAS">{report.development.strengths.map(s=><p key={s}>• {s}</p>)}</ReportSection>
    <ReportSection title="FRAQUEZAS E LEAKS">{report.development.weaknesses.map(w=><div className={styles.block} key={w.title}><strong>{w.severity} · {w.title}</strong><p>{w.why}</p><small>TREINO RECOMENDADO: {w.trainingTag}</small></div>)}</ReportSection>
    <ReportSection title="PLANO DE EVOLUÇÃO / CHECKLIST"><p>{completed} / {report.development.checklist.length} TAREFAS CONCLUÍDAS</p><div style={{display:"grid",gap:8}}>{report.development.checklist.map(item=><div className={styles.block} key={item.id}><strong>{item.priority} · {item.title}</strong><p>{item.reason}</p><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(["PENDENTE","EM ESTUDO","CONCLUÍDO"] as const).map(status=><button type="button" key={status} className={`${styles.modeButton} ${item.status===status?styles.modeButtonActive:""}`} onClick={()=>onChecklist(report.id,item.id,{status})}><strong>{status}</strong></button>)}</div><label style={{display:"grid",gap:4,marginTop:6}}>PROGRAMAR DATA<input type="date" value={item.dueAt?new Date(item.dueAt).toISOString().slice(0,10):""} onChange={e=>onChecklist(report.id,item.id,{dueAt:e.target.value?new Date(`${e.target.value}T12:00:00`).getTime():null})}/></label></div>)}</div></ReportSection>
    {deltas&&<ReportSection title="EVOLUÇÃO DESDE A ANÁLISE ANTERIOR"><div className={styles.resultGrid}><Metric label="AGRESSÃO" value={delta(deltas.aggression)}/><Metric label="DISCIPLINA" value={delta(deltas.discipline)}/><Metric label="PRESSÃO" value={delta(deltas.pressure)}/><Metric label="PASSIVIDADE" value={delta(deltas.passivity)}/></div></ReportSection>}
    <ReportSection title="COMO O RESULTADO FOI OBTIDO">{report.development.methodology.map((m,i)=><p key={m}>{i+1}. {m}</p>)}</ReportSection>
    <ReportSection title="INTEGRAÇÃO STACKUP"><p>Exporte spots, evidências e prescrições de treino no contrato comum STACKUP EXCHANGE v1. O outro app poderá importar este arquivo sem depender deste repositório.</p><button type="button" className="primary" onClick={downloadExchange}>EXPORTAR PARA STACKUP</button></ReportSection>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" className="primary" onClick={onBack}>VOLTAR ÀS ANÁLISES</button><button type="button" className={styles.modeButton} onClick={onRename}><strong>EDITAR NOME</strong></button><button type="button" className={styles.modeButton} onClick={download}><strong>BAIXAR RELATÓRIO</strong></button><button type="button" className={styles.modeButton} onClick={downloadJson}><strong>BAIXAR DADOS</strong></button><button type="button" className={styles.modeButton} onClick={whatsapp}><strong>ENVIAR PLANO NO WHATSAPP</strong></button></div>
  </div>
}

function migrateSession(raw:any,n:number):SavedDnaSession{return{mode:raw.mode==="TORNEIO"?"TORNEIO":"CASH",target:Number(raw.target)||100,index:Number(raw.index)||0,answers:Array.isArray(raw.answers)?raw.answers:[],finished:!!raw.finished,sessionSeed:Number(raw.sessionSeed)||Date.now(),updatedAt:Number(raw.updatedAt)||Date.now(),name:typeof raw.name==="string"?raw.name:`ANÁLISE ${n} · ${raw.mode==="TORNEIO"?"TORNEIO":"CASH"}`,createdAt:Number(raw.createdAt)||Number(raw.updatedAt)||Date.now()}}
function migrateReport(raw:any):DnaReport{const base=migrateSession(raw,1);const result=raw.result??{label:"PERFIL EM FORMAÇÃO",scores:{aggression:0,discipline:0,pressure:0,passivity:0}};const spots=buildBalancedSpotSession(playerDnaSpots,base.mode,base.target,base.sessionSeed);const evalResult=evaluatePlayerDna(spots,base.answers);const development=raw.development??buildPlayerDevelopmentReport(base.mode,spots,base.answers,{...evalResult,label:result.label,scores:result.scores});return{...base,id:String(raw.id??base.sessionSeed),completedAt:Number(raw.completedAt)||base.updatedAt,finished:true,result,development}}
function ReportSection({title,children}:{title:string;children:ReactNode}){return <section className={styles.block}><h4 className={styles.blockTitle}>{title}</h4>{children}</section>}
function Board({spot}:{spot:PlayerDnaSpot}){const cards=spot.board?.split(" ").filter(Boolean)??[];return <section className={styles.block}><h4 className={styles.blockTitle}>BOARD</h4><div className={styles.boardRow}><span className={styles.badge}>{spot.street}</span>{cards.length>0&&<div className={styles.cards}>{cards.map(card=><span className={styles.card} key={card}>{card}</span>)}</div>}</div></section>}
function Pot({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>POT</h4><div className={styles.potRows}><div className={styles.potRow}><span className={styles.badge}>MAIN</span><span className={styles.potValue}>{fmt(spot.pot.main,spot.mode)}</span><span className={styles.participants}>{spot.players.map(p=>p.position).join(" · ")}</span></div>{spot.pot.sides?.map((side,i)=><div className={styles.potRow} key={i}><span className={styles.badge}>SIDE {i+1}</span><span className={styles.potValue}>{fmt(side.value,spot.mode)}</span><span className={styles.participants}>{side.players.join(" · ")}</span></div>)}</div></section>}
function Players({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>JOGADORES</h4><div className={styles.players}>{spot.players.map(player=><div className={`${styles.playerRow} ${player.hero?styles.hero:""}`} key={player.position}><Cell label="POSIÇÃO"><span className={styles.badge}>{player.position}</span></Cell><Cell label="CARTAS">{player.hero?<div className={styles.cards}>{spot.heroCards.split(" ").map(card=><span className={styles.card} key={card}>{card}</span>)}</div>:<div className={styles.closedCards}><span className={styles.closed}/><span className={styles.closed}/></div>}</Cell><Cell label="STACK"><span className={styles.value}>{fmt(player.stack,spot.mode)}</span></Cell><Cell label="AÇÃO"><span className={styles.value}>{player.hero?"---":player.action}</span></Cell><Cell label="VALOR"><span className={styles.value}>{player.hero?"---":player.value===0?"---":fmt(player.value,spot.mode)}</span></Cell></div>)}</div></section>}
function Scenario({spot}:{spot:PlayerDnaSpot}){return <section className={styles.block}><h4 className={styles.blockTitle}>CENÁRIO</h4><div className={styles.scenario}>{spot.scenario.map(item=><span className={styles.badge} key={item}>{item}</span>)}</div></section>}
function Cell({label,children}:{label:string;children:ReactNode}){return <div className={styles.cell}><span className={styles.label}>{label}</span>{children}</div>}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><small>{label}</small><strong>{value}</strong></div>}
function fmt(value:number,mode:GameMode){return mode==="TORNEIO"?`${trim(value)} BB`:`${Math.round(value)}K`}
function trim(value:number){return Number.isInteger(value)?String(value):value.toFixed(1)}
function safeName(value:string){return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9-_]+/g,"_").replace(/^_+|_+$/g,"").toLowerCase()||"player-dna-report"}
function delta(v:number){return `${v>0?"+":""}${v} p.p.`}
