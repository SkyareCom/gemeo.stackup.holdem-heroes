"use client";

import {useEffect,useMemo,useState} from "react";
import {buildBalancedSpotSession} from "@/lib/player-dna-sampler";
import {playerDnaSpots,type GameMode,type PlayerAction,type PlayerDnaSpot} from "@/data/player-dna-spots";

const TRAINING_LAUNCH_KEY="stackup.training.launch.v1";
const TRAINING_LAUNCH_EVENT="stackup:training-launch";

type TrainingLaunch={version:1;id:string;prescriptionId:string;analysisId:string|null;leakId:string|null;sourceRecordId:string;title:string;reason:string;mode:GameMode|null;street:PlayerDnaSpot["street"]|null;positions:string[];trainingTags:string[];conceptTags:string[];targetSpots:number;difficultyMin:number|null;difficultyMax:number|null;timerSeconds:number|null;reviewWrongAnswers:boolean;createdAt:number};
type Answer={spotId:string;action:PlayerAction};

export default function StackupTrainingWorkspace(){
 const[launch,setLaunch]=useState<TrainingLaunch|null>(null);const[index,setIndex]=useState(0);const[answers,setAnswers]=useState<Answer[]>([]);const[finished,setFinished]=useState(false);
 useEffect(()=>{function consume(value:unknown){if(validLaunch(value)){setLaunch(value);setIndex(0);setAnswers([]);setFinished(false)}}try{const raw=localStorage.getItem(TRAINING_LAUNCH_KEY);if(raw)consume(JSON.parse(raw))}catch{}const listener=(event:Event)=>consume((event as CustomEvent).detail);window.addEventListener(TRAINING_LAUNCH_EVENT,listener);return()=>window.removeEventListener(TRAINING_LAUNCH_EVENT,listener)},[]);
 const pool=useMemo(()=>launch?filterPool(launch):[],[launch]);
 const target=launch?Math.max(1,Math.min(launch.targetSpots,3000)):0;
 const session=useMemo(()=>launch&&pool.length?buildBalancedSpotSession(pool,launch.mode??pool[0].mode,target,hashSeed(launch.id)):[],[launch,pool,target]);
 const spot=session[index];
 function answer(action:PlayerAction){if(!spot||!launch)return;const next=[...answers,{spotId:spot.id,action}];setAnswers(next);if(next.length>=session.length){setFinished(true);return}setIndex(v=>v+1)}
 function close(){try{localStorage.removeItem(TRAINING_LAUNCH_KEY)}catch{}setLaunch(null);setAnswers([]);setIndex(0);setFinished(false)}
 if(!launch)return null;
 if(pool.length===0)return <section style={shell}><div className="eyebrow">TREINO PRESCRITO</div><h3>{launch.title}</h3><p>NENHUM SPOT COMPATÍVEL COM TODOS OS FILTROS. O TREINO NÃO FOI INICIADO PARA EVITAR CONTEÚDO FORA DA PRESCRIÇÃO.</p><FilterSummary launch={launch}/><button onClick={close}>FECHAR</button></section>;
 if(finished)return <section style={shell}><div className="eyebrow">TREINO PRESCRITO</div><h3>SESSÃO CONCLUÍDA</h3><p>{answers.length} SPOTS TREINADOS · {launch.title}</p><FilterSummary launch={launch}/><button className="primary" onClick={close}>VOLTAR AO PLAYER DNA</button></section>;
 if(!spot)return null;
 return <section style={shell}><div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}><div><div className="eyebrow">TREINO PRESCRITO</div><h3 style={{margin:"6px 0"}}>{launch.title}</h3><p style={{margin:0,opacity:.7,fontSize:12}}>{launch.reason}</p></div><button onClick={close}>ENCERRAR</button></div><FilterSummary launch={launch}/><div style={{marginTop:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12}}><span>SPOT {index+1} / {session.length}</span><strong>{Math.round(index/session.length*100)}%</strong></div><div style={{height:5,background:"rgba(255,255,255,.08)",borderRadius:8,marginTop:6}}><i style={{display:"block",height:"100%",width:`${index/session.length*100}%`,background:"currentColor",borderRadius:8}}/></div></div><SpotView spot={spot} onAnswer={answer}/></section>
}

function SpotView({spot,onAnswer}:{spot:PlayerDnaSpot;onAnswer:(action:PlayerAction)=>void}){const hero=spot.players.find(p=>p.hero);return <div style={{display:"grid",gap:10,marginTop:14}}><div style={card}><small>{spot.mode} · {spot.street} · {spot.scenario.join(" · ")}</small><h4 style={{margin:"6px 0"}}>{spot.prompt}</h4></div><div style={card}><strong>BOARD</strong><p style={{fontSize:18,margin:"6px 0"}}>{spot.board??"PRÉ-FLOP"}</p></div><div style={card}><strong>HERÓI · {hero?.position??"—"}</strong><p style={{fontSize:20,margin:"6px 0"}}>{spot.heroCards}</p><small>POT {spot.mode==="TORNEIO"?`${spot.pot.main} BB`:`${spot.pot.main}K`}</small></div><p style={{textAlign:"center",fontWeight:800}}>QUAL A SUA AÇÃO?</p><div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:8}}>{spot.actions.map(action=><button key={action} className="primary" onClick={()=>onAnswer(action)}>{action}</button>)}</div></div>}
function FilterSummary({launch}:{launch:TrainingLaunch}){return <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:10,fontSize:11}}><span style={pill}>{launch.mode??"MISTO"}</span><span style={pill}>{launch.street??"TODAS STREETS"}</span>{launch.positions.map(p=><span key={p} style={pill}>{p}</span>)}{launch.trainingTags.map(tag=><span key={tag} style={pill}>{tag}</span>)}{launch.timerSeconds&&<span style={pill}>{launch.timerSeconds}s</span>}</div>}
function filterPool(launch:TrainingLaunch){const tags=launch.trainingTags.map(normalize);const positions=launch.positions.map(normalize);let rows=playerDnaSpots.filter(spot=>(!launch.mode||spot.mode===launch.mode)&&(!launch.street||spot.street===launch.street));if(positions.length)rows=rows.filter(spot=>spot.players.some(p=>positions.includes(normalize(p.position))));if(tags.length){const tagged=rows.filter(spot=>{const text=normalize([spot.id,spot.prompt,...spot.scenario].join(" "));return tags.some(tag=>text.includes(tag)||tag.includes("PLAYER DNA RETEST"))});if(tagged.length)rows=tagged}return rows}
function normalize(v:string){return v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z0-9]+/g," ").trim()}
function hashSeed(value:string){let h=2166136261;for(let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619)}return Math.abs(h)||1}
function validLaunch(value:unknown):value is TrainingLaunch{if(!value||typeof value!=="object")return false;const row=value as Partial<TrainingLaunch>;return row.version===1&&typeof row.id==="string"&&typeof row.title==="string"&&typeof row.targetSpots==="number"&&Array.isArray(row.trainingTags)&&Array.isArray(row.positions)}
const shell={marginBottom:16,border:"1px solid rgba(92,187,126,.32)",borderRadius:16,padding:16,background:"rgba(7,20,12,.9)"} as const;
const card={padding:12,border:"1px solid rgba(92,187,126,.16)",borderRadius:10} as const;
const pill={padding:"5px 8px",border:"1px solid rgba(92,187,126,.18)",borderRadius:999,opacity:.78} as const;
