"use client";
import {useEffect,useMemo,useState} from "react";
import MathWorkspace from "../components/MathWorkspace";
import AIWorkspace from "../components/AIWorkspace";
import SharedPokerTable from "../components/SharedPokerTable";
import {formatProfileMetric, type PokerDecision, type PlayerDNA} from "../lib/profile-engine";
import {classifyPlayerArchetype,diagnosticReadiness,profileMetrics} from "../lib/profile-diagnostic";
import {getPlayerDNAFromMemory, recordDecision} from "../lib/player-memory";
import {balancedSpotSample} from "../lib/spot-sampler";
import {generateTrainingSpotBank,stackBucketToBB,type TrainingSpot} from "../data/training-spots";
import {reconstructHand,reconstructionSummary,type ReconstructedHand} from "../lib/hand-reconstruction";

type Module="home"|"profile"|"hands"|"ai"|"math";
const depths=[[100,"Perfil inicial / análise rápida"],[300,"Análise intermediária"],[500,"Análise avançada"],[1000,"Perfil de alta robustez"],[3000,"Análise profunda do jogador"]] as const;
const trainingBank=generateTrainingSpotBank();

export default function Home(){
  const[module,setModule]=useState<Module>("home");
  const[selectedDepth,setSelectedDepth]=useState<number|null>(null);
  const[handText,setHandText]=useState("");
  const[reconstruction,setReconstruction]=useState<ReconstructedHand|null>(null);
  function analyzeHand(){setReconstruction(reconstructHand(handText));}
  return <main><header className="topbar"><button className="logo" onClick={()=>setModule("home")}><span>STACKUP</span> HOLD&apos;EM <b>AI SOLVER</b></button><span className="status">● PLAYER INTELLIGENCE SYSTEM</span></header>{module==="home"&&<><section className="hero"><p>POKER · SOLVER · IA · DADOS</p><h1>ELE NÃO APENAS ENSINA POKER.<br/><em>ELE APRENDE COMO VOCÊ JOGA.</em></h1><div className="hero-copy">Decisões simuladas, mãos reais, matemática e dúvidas conectadas para construir uma leitura progressiva do seu jogo.</div></section><section className="home-grid four"><Card n="01" eye="PLAYER DNA" title="PERFIL DE JOGADOR" text="Descubra como você realmente joga." action="DESCOBRIR PERFIL" click={()=>setModule("profile")}/><Card n="02" eye="AI HAND REVIEW" title="ANÁLISE DE MÃOS" text="Conte uma mão. O sistema reconstrói o contexto antes da análise." action="ANALISAR UMA MÃO" click={()=>setModule("hands")}/><Card n="03" eye="POKER ASSISTANT" title="PERGUNTE À IA" text="Estratégia, regras, situações e dúvidas sobre poker." action="FAZER UMA PERGUNTA" click={()=>setModule("ai")}/><Card n="04" eye="POKER MATH" title="MATEMÁTICA DO POKER" text="Conceitos, prática e dúvidas com cálculo determinístico." action="ESTUDAR E CALCULAR" click={()=>setModule("math")}/></section><section className="memory-strip"><div><small>MEMÓRIA COMPARTILHADA</small><strong>UM JOGADOR · UM CONTEXTO · UMA EVOLUÇÃO</strong></div><p>Perfil, mãos, matemática, notas e conhecimento formam uma única inteligência do jogador.</p></section></>}
  {module==="profile"&&<section className="workspace"><Back click={()=>setModule("home")}/><div className="eyebrow">PLAYER DNA</div><h2>DESCUBRA COMO VOCÊ REALMENTE JOGA.</h2>{!selectedDepth?<><p className="lead">Escolha a profundidade. A seleção será variada e balanceada entre situações do jogo.</p><div className="depth-grid">{depths.map(([n,label])=><button key={n} onClick={()=>setSelectedDepth(n)}><strong>{n}</strong><span>SPOTS</span><small>{label}</small></button>)}</div><div className="truth-note"><b>BANCO DIAGNÓSTICO MULTIDIMENSIONAL</b><span>Street, posição, stack, pote, IP/OOP, textura, game type e oportunidades comportamentais são balanceados automaticamente.</span></div></>:<SpotSession depth={selectedDepth} reset={()=>setSelectedDepth(null)}/>}</section>}
  {module==="hands"&&<section className="workspace"><Back click={()=>setModule("home")}/><div className="eyebrow purple">AI HAND REVIEW</div><h2>CONTE UMA MÃO.</h2><p className="lead">Escreva naturalmente. Primeiro o sistema reconstrói fatos; depois matemática e IA podem analisar.</p><div className="hand-layout"><div><textarea value={handText} onChange={e=>{setHandText(e.target.value);setReconstruction(null)}} placeholder="Ex.: Torneio, blinds 1k/2k. BTN com A♦K♦, 40bb efetivos. Pré-flop... Flop A♠ 7♥ 2♣..."/><button className="primary purple-btn" onClick={analyzeHand} disabled={!handText.trim()}>RECONSTRUIR MÃO</button></div><SharedPokerTable hero={reconstruction?.heroPosition?`HERO · ${reconstruction.heroPosition} · ${reconstruction.heroHand??"?"}`:undefined} board={reconstruction?.board.length?reconstruction.board:undefined}/></div>{reconstruction?<HandReconstructionPanel hand={reconstruction}/>:<div className="analysis-preview"><Result title="ETAPA 1" text="Reconstrução determinística dos dados explícitos."/><Result title="ETAPA 2" text="Identificação do que está ausente antes de qualquer inferência."/><Result title="ETAPA 3" text="Cálculos e análise estratégica sobre contexto validado."/></div>}</section>}
  {module==="ai"&&<AIWorkspace onBack={()=>setModule("home")}/>} 
  {module==="math"&&<MathWorkspace onBack={()=>setModule("home")}/>}</main>
}

function Card({n,eye,title,text,action,click}:{n:string;eye:string;title:string;text:string;action:string;click:()=>void}){return <button className="module-card" onClick={click}><span className="card-number">{n}</span><small>{eye}</small><h3>{title}</h3><p>{text}</p><b>{action} →</b></button>}
function Back({click}:{click:()=>void}){return <button className="back" onClick={click}>← HOME</button>}
function Result({title,text}:{title:string;text:string}){return <div className="result"><b>{title}</b><p>{text}</p></div>}

const actionMap:Record<string,PokerDecision["action"]>={FOLD:"fold",CHECK:"check",CALL:"call",RAISE:"raise","BET 33%":"bet","BET 75%":"bet","ALL-IN":"allin"};
const diagnosticOpportunities = new Set<NonNullable<PokerDecision["opportunity"]>>([
  "vpip","pfr","3bet","4bet","squeeze","blind-defense","cbet","fold-to-cbet","check-raise","probe","delayed-cbet","double-barrel","triple-barrel","overbet","bluff-catch","thin-value","value","bluff","shove","icm-pressure"
]);

function opportunityForSpot(spot:TrainingSpot):PokerDecision["opportunity"]{
  const raw=spot.actionOpportunity as NonNullable<PokerDecision["opportunity"]>|undefined;
  return raw&&diagnosticOpportunities.has(raw)?raw:undefined;
}

function SpotSession({depth,reset}:{depth:number;reset:()=>void}){
  const spots=useMemo(()=>balancedSpotSample(trainingBank,depth) as TrainingSpot[],[depth]);
  const[decision,setDecision]=useState<string|null>(null);
  const[index,setIndex]=useState(0);
  const[dna,setDna]=useState<PlayerDNA|null>(null);
  const[finished,setFinished]=useState(false);
  useEffect(()=>{setDna(getPlayerDNAFromMemory())},[]);
  const spot=spots[index];

  function commitDecision(){
    if(!decision||!spot)return;
    recordDecision({spotId:spot.id,street:spot.street,position:spot.heroPosition,villainPosition:spot.villainPosition,inPosition:spot.inPosition,stackBB:stackBucketToBB(spot.stackBucket,index),gameType:spot.gameType,action:actionMap[decision]??"check",facingAggression:spot.facingBetBB!==undefined,opportunity:opportunityForSpot(spot),tags:[spot.potType,spot.players,spot.boardTexture??"none",spot.theme]});
    setDna(getPlayerDNAFromMemory());
    if(index>=spots.length-1){setFinished(true);return;}
    setDecision(null);setIndex(i=>i+1);
  }

  if(finished)return <div className="spot-session"><div className="session-head"><div><small>SESSÃO CONCLUÍDA</small><strong>{spots.length} / {spots.length} SPOTS</strong></div><button onClick={reset}>NOVA SESSÃO</button></div><PlayerDnaPanel dna={dna}/></div>;
  if(!spot)return <div className="truth-note"><b>SEM SPOTS DISPONÍVEIS</b><span>O banco de treino não retornou situações para esta sessão.</span></div>;

  return <div className="spot-session"><div className="session-head"><div><small>PROGRESSO</small><strong>{index+1} / {spots.length} SPOTS</strong></div><button onClick={reset}>ALTERAR</button></div><SharedPokerTable villain={`VILLAIN · ${spot.villainPosition??"?"}`} hero={`HERO · ${spot.heroPosition} · ${spot.heroHand}`} board={spot.board} pot={`${spot.potBB} BB`}/><div className="spot-meta"><span>{spot.gameType?.toUpperCase()}</span><span>{stackBucketToBB(spot.stackBucket,index)} BB</span><span>{spot.heroPosition} vs {spot.villainPosition}</span><span>{spot.potType.toUpperCase()}</span><span>{spot.street.toUpperCase()}</span><span>{spot.inPosition?"IP":"OOP"}</span><span>{spot.actionOpportunity?.toUpperCase()}</span></div>{spot.facingBetBB!==undefined&&<p className="lead">Você enfrenta uma aposta de <b>{spot.facingBetBB} BB</b>.</p>}<h3>QUAL É A SUA DECISÃO?</h3><div className="actions">{spot.legalActions.map(a=><button className={decision===a?"selected":""} key={a} onClick={()=>setDecision(a)}>{a}</button>)}</div>{decision&&<div className="decision-record"><b>DECISÃO: {decision}</b><span>Spot {spot.id} · {spot.boardTexture} · {spot.actionOpportunity}</span><button onClick={commitDecision}>{index>=spots.length-1?"FINALIZAR":"PRÓXIMO SPOT →"}</button></div>}<PlayerDnaPanel dna={dna}/></div>
}

function PlayerDnaPanel({dna}:{dna:PlayerDNA|null}){
  if(!dna)return null;
  const readiness=diagnosticReadiness(dna);
  const classification=classifyPlayerArchetype(dna);
  const metrics=profileMetrics(dna);
  return <div className="analysis-preview">
    <Result title="ROBUSTEZ" text={`${dna.robustness} · ${dna.sampleSize} decisões registradas`}/>
    <Result title="PRONTIDÃO DIAGNÓSTICA" text={`${readiness.label} · ${readiness.readyMetrics}/${readiness.totalMetrics} métricas utilizáveis · ${readiness.robustMetrics} robustas`}/>
    <Result title="ARQUÉTIPO" text={classification.archetype==="UNDETERMINED"?"DADOS INSUFICIENTES":`${classification.archetype} · confiança ${(classification.confidence*100).toFixed(0)}%`}/>
    {metrics.map(m=><Result key={m.label} title={m.label} text={`${formatProfileMetric(m)} · ${m.opportunities} oportunidades · ${m.confidence}`}/>)}
  </div>
}

function HandReconstructionPanel({hand}:{hand:ReconstructedHand}){
  return <><div className="analysis-preview"><Result title={`RECONSTRUÇÃO · ${hand.confidence}`} text={reconstructionSummary(hand)}/><Result title="BOARD IDENTIFICADO" text={hand.board.length?hand.board.join(" "):"Não identificado explicitamente."}/><Result title="STREETS IDENTIFICADAS" text={hand.streets.length?hand.streets.map(s=>s.street.toUpperCase()).join(" → "):"Nenhuma street delimitada."}/><Result title="DADOS AUSENTES" text={hand.missing.length?hand.missing.join(" · "):"Nenhum campo crítico ausente."}/></div>{hand.streets.length>0&&<div className="concept-detail">{hand.streets.map(s=><section key={s.street}><b>{s.street.toUpperCase()}</b><p>{s.text}</p></section>)}</div>}</>
}
