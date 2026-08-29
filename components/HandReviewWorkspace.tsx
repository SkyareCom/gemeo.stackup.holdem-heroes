"use client";

import {useMemo,useState} from "react";
import {
  actions,fieldLeftOptions,handReviewSummary,positions,ranks,requiredBoardCards,streets,suits,
  tableSizes,tournamentPhases,tournamentTypes,validateHandReview,
  type Card,type FieldLeft,type HandAction,type HandGameMode,type HandReviewInput,type Position,type Rank,type Street,type Suit,type TableSize,type TournamentPhase,type TournamentType,
} from "@/lib/hand-review";
import styles from "./HandReviewWorkspace.module.css";

type PickerTarget={kind:"hero"|"board";index:number}|null;

const emptyInput:HandReviewInput={
  game:"CASH",tournamentTypes:[],tournamentPhase:null,fieldLeft:null,tableSize:null,heroPosition:null,
  villainPositions:[],heroStack:null,villainStacks:{},street:"PREFLOP",board:[],heroCards:[],villainActions:{},heroAction:null,notes:"",
};

export default function HandReviewWorkspace(){
  const[input,setInput]=useState<HandReviewInput>(emptyInput);
  const[submitted,setSubmitted]=useState(false);
  const[picker,setPicker]=useState<PickerTarget>(null);
  const[pickRank,setPickRank]=useState<Rank|null>(null);
  const[pickSuit,setPickSuit]=useState<Suit|null>(null);
  const validation=useMemo(()=>validateHandReview(input),[input]);
  const summary=useMemo(()=>handReviewSummary(input),[input]);

  function patch<K extends keyof HandReviewInput>(key:K,value:HandReviewInput[K]){setInput(prev=>({...prev,[key]:value}));setSubmitted(false)}
  function setGame(game:HandGameMode){setInput(prev=>({...prev,game,...(game==="CASH"?{tournamentTypes:[],tournamentPhase:null,fieldLeft:null}:{})}));setSubmitted(false)}
  function toggleTournamentType(value:TournamentType){patch("tournamentTypes",input.tournamentTypes.includes(value)?input.tournamentTypes.filter(v=>v!==value):[...input.tournamentTypes,value])}
  function selectHeroPosition(position:Position){setInput(prev=>({...prev,heroPosition:position,villainPositions:prev.villainPositions.filter(p=>p!==position)}));setSubmitted(false)}
  function toggleVillain(position:Position){if(position===input.heroPosition)return;const exists=input.villainPositions.includes(position);setInput(prev=>({...prev,villainPositions:exists?prev.villainPositions.filter(p=>p!==position):[...prev.villainPositions,position]}));setSubmitted(false)}
  function setVillainStack(position:Position,value:string){setInput(prev=>({...prev,villainStacks:{...prev.villainStacks,[position]:numberOrNull(value)??undefined}}));setSubmitted(false)}
  function setVillainAction(position:Position,action:HandAction){setInput(prev=>({...prev,villainActions:{...prev.villainActions,[position]:action}}));setSubmitted(false)}
  function setStreet(street:Street){const count=requiredBoardCards(street);setInput(prev=>({...prev,street,board:prev.board.slice(0,count)}));setSubmitted(false)}
  function openPicker(kind:"hero"|"board",index:number){setPicker({kind,index});setPickRank(null);setPickSuit(null)}
  function selectRank(rank:Rank){setPickRank(rank);if(pickSuit)commitCard(rank,pickSuit)}
  function selectSuit(suit:Suit){setPickSuit(suit);if(pickRank)commitCard(pickRank,suit)}
  function commitCard(rank:Rank,suit:Suit){if(!picker)return;const card=`${rank}${suit}` as Card;const used=[...input.heroCards,...input.board];const current=picker.kind==="hero"?input.heroCards[picker.index]:input.board[picker.index];if(used.includes(card)&&current!==card)return;setInput(prev=>{const list=[...(picker.kind==="hero"?prev.heroCards:prev.board)];list[picker.index]=card;return picker.kind==="hero"?{...prev,heroCards:list as Card[]}:{...prev,board:list as Card[]}});setSubmitted(false);setPicker(null);setPickRank(null);setPickSuit(null)}
  function clearCard(){if(!picker)return;setInput(prev=>{const list=[...(picker.kind==="hero"?prev.heroCards:prev.board)];list.splice(picker.index,1);return picker.kind==="hero"?{...prev,heroCards:list as Card[]}:{...prev,board:list as Card[]}});setPicker(null);setSubmitted(false)}
  function analyze(){setSubmitted(true);if(validation.valid)window.scrollTo({top:0,behavior:"smooth"})}
  function reset(){setInput(emptyInput);setSubmitted(false)}

  if(submitted&&validation.valid)return <Analysis input={input} onBack={()=>setSubmitted(false)} onReset={reset}/>;

  const boardCount=requiredBoardCards(input.street);
  return <div className={styles.workspace}>
    <header className={styles.intro}><div className="eyebrow">AI HAND REVIEW</div><h2>MONTE A MÃO</h2><p>SELECIONE CADA INFORMAÇÃO PARA EVITAR ANÁLISES COM DADOS INCOMPLETOS.</p></header>

    <Section title="QUAL A MODALIDADE?">
      <div className={styles.two}>{(["CASH","TORNEIO"] as HandGameMode[]).map(game=><Choice key={game} active={input.game===game} onClick={()=>setGame(game)}>{game}</Choice>)}</div>
    </Section>

    {input.game==="TORNEIO"&&<>
      <Section title="TIPO DE TORNEIO" helper="SELECIONE 1 OU MAIS"><div className={styles.grid}>{tournamentTypes.map(type=><Choice key={type} active={input.tournamentTypes.includes(type)} onClick={()=>toggleTournamentType(type)}>{type}</Choice>)}</div></Section>
      <Section title="FASE DO TORNEIO"><div className={styles.grid}>{tournamentPhases.map(phase=><Choice key={phase} active={input.tournamentPhase===phase} onClick={()=>patch("tournamentPhase",phase as TournamentPhase)}>{phase}</Choice>)}</div></Section>
      <Section title="FIELD LEFT"><div className={styles.four}>{fieldLeftOptions.map(value=><Choice key={value} active={input.fieldLeft===value} onClick={()=>patch("fieldLeft",value as FieldLeft)}>{value}</Choice>)}</div></Section>
    </>}

    <Section title="JOGADORES POR MESA"><div className={styles.five}>{tableSizes.map(size=><Choice key={size} active={input.tableSize===size} onClick={()=>patch("tableSize",size as TableSize)}>{size}</Choice>)}</div></Section>

    <Section title="POSIÇÃO · HERÓI"><div className={styles.positionGrid}>{positions.map(position=><Choice key={position} active={input.heroPosition===position} onClick={()=>selectHeroPosition(position)}>{position}</Choice>)}</div></Section>

    <Section title="POSIÇÕES · VILÕES" helper="SELECIONE 1 OU MAIS"><div className={styles.positionGrid}>{positions.map(position=><Choice key={position} active={input.villainPositions.includes(position)} disabled={input.heroPosition===position} onClick={()=>toggleVillain(position)}>{position}</Choice>)}</div></Section>

    <Section title="STACKS">
      <StackRow label="HERÓI" value={input.heroStack} onChange={value=>patch("heroStack",numberOrNull(value))}/>
      {input.villainPositions.length===0?<p className={styles.muted}>SELECIONE OS VILÕES PARA PREENCHER OS STACKS.</p>:input.villainPositions.map(position=><StackRow key={position} label={position} value={input.villainStacks[position]??null} onChange={value=>setVillainStack(position,value)}/>) }
    </Section>

    <Section title="STREET"><div className={styles.four}>{streets.map(street=><Choice key={street} active={input.street===street} onClick={()=>setStreet(street)}>{street}</Choice>)}</div></Section>

    <Section title="BOARD">
      <div className={styles.cards}>{Array.from({length:5},(_,index)=><CardSlot key={index} card={input.board[index]} disabled={index>=boardCount} onClick={()=>openPicker("board",index)}/>)}</div>
    </Section>

    <Section title="AÇÕES · VILÕES">
      {input.villainPositions.length===0?<p className={styles.muted}>SELECIONE OS VILÕES PARA DEFINIR AS AÇÕES.</p>:input.villainPositions.map(position=><div className={styles.actionRow} key={position}><span className={styles.badge}>{position}</span><div className={styles.actionGrid}>{actions.filter(action=>action!=="FOLD").map(action=><Choice key={action} active={input.villainActions[position]===action} onClick={()=>setVillainAction(position,action)}>{action}</Choice>)}</div></div>)}
    </Section>

    <Section title="HERÓI · MÃO"><div className={styles.heroCards}>{[0,1].map(index=><CardSlot key={index} card={input.heroCards[index]} onClick={()=>openPicker("hero",index)}/>)}</div><h4 className={styles.subhead}>SUA AÇÃO</h4><div className={styles.actionGrid}>{actions.map(action=><Choice key={action} active={input.heroAction===action} onClick={()=>patch("heroAction",action)}>{action}</Choice>)}</div></Section>

    <Section title="OUTRAS INFORMAÇÕES"><textarea className={styles.notes} value={input.notes} onChange={e=>patch("notes",e.target.value)} placeholder="Blinds, antes, sizings, reads, dinâmica, payout, bounty e outras informações relevantes..."/></Section>

    {submitted&&!validation.valid&&<div className={styles.validation}><strong>INFORMAÇÕES INCOMPLETAS</strong>{validation.missing.length>0&&<p>{validation.missing.join(" · ")}</p>}{validation.conflicts.length>0&&<p>{validation.conflicts.join(" · ")}</p>}</div>}
    <button className="primary" onClick={analyze}>ANÁLISE E COMENTÁRIOS</button>

    {picker&&<div className={styles.modalBackdrop} onClick={()=>setPicker(null)}><div className={styles.modal} onClick={e=>e.stopPropagation()}><div className={styles.modalHead}><strong>SELECIONE A CARTA</strong><button onClick={()=>setPicker(null)}>×</button></div><div className={styles.rankGrid}>{ranks.map(rank=><Choice key={rank} active={pickRank===rank} onClick={()=>selectRank(rank)}>{rank}</Choice>)}</div><div className={styles.suitGrid}>{suits.map(suit=><Choice key={suit} active={pickSuit===suit} onClick={()=>selectSuit(suit)}>{suit}</Choice>)}</div><button className={styles.clear} onClick={clearCard}>LIMPAR CARTA</button></div></div>}
  </div>;
}

function Analysis({input,onBack,onReset}:{input:HandReviewInput;onBack:()=>void;onReset:()=>void}){
  const summary=handReviewSummary(input);
  return <div className={styles.workspace}><div className={styles.analysisHead}><button className={styles.back} onClick={onBack}>← MÃO</button><div><div className="eyebrow">AI HAND REVIEW</div><h2>ANÁLISE DA MÃO</h2></div></div><div className={styles.summary}>{Object.entries({MODALIDADE:summary.modality,MESA:summary.table,HERÓI:summary.hero,VILÕES:summary.villains,STREET:summary.street,BOARD:summary.board,"AÇÃO DO HERÓI":summary.heroAction}).map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><div className={styles.analysisGrid}><AnalysisCard title="O QUE ACONTECEU" text={`${summary.hero} enfrenta ${input.villainPositions.join(", ")} em ${input.street}. A ação registrada do herói é ${summary.heroAction}.`}/><AnalysisCard title="ANÁLISE" text="A mão está estruturalmente completa. O motor pode agora usar posição, stacks, street, board e sequência de ações sem precisar inferir informações ausentes."/><AnalysisCard title="MELHOR LINHA" text="A recomendação estratégica exata será conectada ao motor de ranges, EV e matemática. Esta interface não inventa uma linha GTO sem cálculo."/><AnalysisCard title="ALTERNATIVAS" text="Fold, check, call, raise, 3-bet, 4-bet e all-in podem ser comparados conforme a street e os dados registrados."/><AnalysisCard title="PONTO PRINCIPAL DA MÃO" text="O formulário estruturado elimina lacunas críticas e prepara a mão para cálculos determinísticos e análise estratégica reproduzível."/></div><div className={styles.metrics}><Metric label="STACK EFETIVO" value={summary.effectiveStack!==null?`${summary.effectiveStack} BB · EXACT`:"DADOS INSUFICIENTES"}/><Metric label="BOARD" value={`${summary.board} · EXACT`}/><Metric label="POT ODDS" value="AGUARDANDO POTE E SIZINGS POR AÇÃO"/><Metric label="SPR" value="AGUARDANDO RECONSTRUÇÃO DO POTE"/></div><button className="primary" onClick={onReset}>NOVA MÃO</button></div>;
}

function Section({title,helper,children}:{title:string;helper?:string;children:React.ReactNode}){return <section className={styles.section}><div className={styles.sectionTitle}><h3>{title}</h3>{helper&&<small>{helper}</small>}</div>{children}</section>}
function Choice({active,disabled,onClick,children}:{active?:boolean;disabled?:boolean;onClick:()=>void;children:React.ReactNode}){return <button type="button" className={`${styles.choice} ${active?styles.active:""}`} disabled={disabled} onClick={onClick}>{children}</button>}
function StackRow({label,value,onChange}:{label:string;value:number|null;onChange:(value:string)=>void}){return <div className={styles.stackRow}><span className={styles.badge}>{label}</span><input type="number" min="0" step="0.1" inputMode="decimal" value={value??""} onChange={e=>onChange(e.target.value)} placeholder="STACK EM BB"/></div>}
function CardSlot({card,disabled,onClick}:{card?:Card;disabled?:boolean;onClick:()=>void}){return <button type="button" className={styles.card} disabled={disabled} onClick={onClick}>{card??"+"}</button>}
function AnalysisCard({title,text}:{title:string;text:string}){return <div className={styles.analysisCard}><small>{title}</small><p>{text}</p></div>}
function Metric({label,value}:{label:string;value:string}){return <div className={styles.metric}><small>{label}</small><strong>{value}</strong></div>}
function numberOrNull(value:string){const parsed=Number(value);return Number.isFinite(parsed)&&parsed>0?parsed:null}
