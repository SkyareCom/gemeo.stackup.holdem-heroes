import type {DecisionSizing} from "@/lib/player-dna";
import type {PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";
import {profileHand,solverHeroNodeStrategy} from "@/lib/gto-range-policy";

export type DecisionGrade="MELHOR LINHA"|"ACEITÁVEL"|"IMPRECISA"|"SEM REFERÊNCIA SUFICIENTE";
export type HandEvaluation={grade:DecisionGrade;confidence:number;recommended:string;frequencies:Partial<Record<PlayerAction,number>>;comment:string;math:string;source:string};

function facingBet(spot:PlayerDnaSpot){
  const hero=spot.players.find(p=>p.hero);if(!hero)return null;
  const previous=spot.players.filter(p=>!p.hero&&p.value>0&&p.action!=="FOLD").map(p=>p.value);
  if(!previous.length)return null;
  const highestCommitted=Math.max(...previous);
  const call=Math.max(0,highestCommitted-(hero.value??0));
  return{call,pot:spot.pot.main};
}
function mathNote(spot:PlayerDnaSpot){const facing=facingBet(spot);if(!facing||facing.call<=0)return"SEM CÁLCULO DE CALL NESTA DECISÃO.";const required=facing.call/(facing.pot+facing.call)*100;return`POT ODDS: ${required.toFixed(1)}% DE EQUIDADE MÍNIMA PARA CALL BREAK-EVEN, ANTES DE ICM/RAKE/REALIZAÇÃO.`}
function order(freq:Partial<Record<PlayerAction,number>>){return(Object.entries(freq) as [PlayerAction,number][]).sort((a,b)=>b[1]-a[1])}
function scenarioText(spot:PlayerDnaSpot){return spot.scenario.join(" ").toUpperCase()}
function multiway(spot:PlayerDnaSpot){return scenarioText(spot).includes("MULTIWAY")||spot.players.filter(p=>!p.hero&&p.action!=="FOLD").length>1}
function icm(spot:PlayerDnaSpot){const t=scenarioText(spot);return t.includes("ICM")||t.includes("BOLHA")||t.includes("FT")}

function recommendedSizing(spot:PlayerDnaSpot,action:PlayerAction):DecisionSizing|null{
  if(action!=="RAISE"&&action!=="BET")return null;
  const h=spot.players.find(p=>p.hero);const stack=h?.stack??100;
  if(spot.street==="PREFLOP")return(stack<=20?"2X":stack<=55?"2.5X":"3X") as DecisionSizing;
  if(action==="BET")return(spot.street==="FLOP"?"33%":spot.street==="TURN"?"50%":"66%") as DecisionSizing;
  return(multiway(spot)?"3X":stack<=30?"2X":"2.5X") as DecisionSizing;
}

function sizingDistance(a:DecisionSizing|null|undefined,b:DecisionSizing|null){if(!a||!b)return 0;const raises=["2X","2.5X","3X","4X"];const bets=["25%","33%","50%","66%","75%","POT","125%","150%"];
  const list=raises.includes(String(b))?raises:bets;const ai=list.indexOf(String(a)),bi=list.indexOf(String(b));return ai<0||bi<0?99:Math.abs(ai-bi)}

function gradeDecision(action:PlayerAction,sizing:DecisionSizing|null|undefined,freq:Partial<Record<PlayerAction,number>>,best:PlayerAction,bestSizing:DecisionSizing|null){
  const selected=freq[action]??0;const top=freq[best]??0;
  if(action===best){const d=sizingDistance(sizing,bestSizing);if(d===0)return"MELHOR LINHA" as const;if(d===1)return"ACEITÁVEL" as const;return"IMPRECISA" as const}
  if(selected>=20||top-selected<=12)return"ACEITÁVEL" as const;
  return"IMPRECISA" as const;
}

function handDescriptor(spot:PlayerDnaSpot){const p=profileHand(spot);const draw=p.comboDraw?"COMBO DRAW":p.flushDraw?"FLUSH DRAW":p.openEnded?"OESD":p.gutshot?"GUTSHOT":"";return`${p.equityClass}${draw?` · ${draw}`:""}`}

function nodeConfidence(bestFreq:number,spot:PlayerDnaSpot){
  // This is node-level decisiveness, not a claim of solver-benchmark accuracy.
  // Keep it conservative until the external calibration battery reaches the product target.
  let score=65+Math.round(Math.min(20,Math.max(0,bestFreq-50)*0.4));
  if(!multiway(spot))score+=3;
  if(!icm(spot))score+=2;
  return Math.max(65,Math.min(88,score));
}

export function evaluateHandDecision(spot:PlayerDnaSpot,action:PlayerAction,sizing?:DecisionSizing|null):HandEvaluation{
  const frequencies=solverHeroNodeStrategy(spot);const ranked=order(frequencies);if(!ranked.length)return{grade:"SEM REFERÊNCIA SUFICIENTE",confidence:0,recommended:"---",frequencies:{},comment:"SPOT SEM AÇÕES VÁLIDAS NO NÓ DE REFERÊNCIA.",math:mathNote(spot),source:"MOTOR GTO PLAYER DNA"};
  const best=ranked[0][0];const bestFreq=ranked[0][1];const bestSizing=recommendedSizing(spot,best);const recommended=bestSizing?`${best} ${bestSizing}`:best;const grade=gradeDecision(action,sizing,frequencies,best,bestSizing);const selectedFreq=frequencies[action]??0;const selected=sizing?`${action} ${sizing}`:action;
  const villainLines=spot.players.filter(p=>!p.hero).map(p=>`${p.position} ${p.action}`).join(" · ");
  const confidence=nodeConfidence(bestFreq,spot);
  const descriptor=handDescriptor(spot);
  const sizingText=(action==="RAISE"||action==="BET")&&bestSizing&&action===best&&sizing&&sizing!==bestSizing?` O SIZING DE REFERÊNCIA É ${bestSizing}.`:"";
  const comment=grade==="MELHOR LINHA"?`${selected}: LINHA PRINCIPAL DO NÓ (${selectedFreq}%). MÃO ${descriptor}. VILÕES: ${villainLines}.`:grade==="ACEITÁVEL"?`${selected}: LINHA PRESENTE NO MIX (${selectedFreq}%). ${recommended} É A PRINCIPAL (${bestFreq}%).${sizingText} MÃO ${descriptor}.`:`${selected}: BAIXA FREQUÊNCIA NO NÓ (${selectedFreq}%). ${recommended} É A LINHA PRINCIPAL (${bestFreq}%).${sizingText} MÃO ${descriptor}.`;
  return{grade,confidence,recommended,frequencies,comment,math:mathNote(spot),source:"MOTOR GTO PLAYER DNA · RANGE DO VILÃO → AÇÃO DO VILÃO → ESTRATÉGIA DO HERÓI"};
}
