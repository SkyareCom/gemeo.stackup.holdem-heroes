import type {DecisionSizing} from "@/lib/player-dna";
import type {PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";
import {normalizeFrequencies,profileHand} from "@/lib/gto-range-policy";

export type DecisionGrade="MELHOR LINHA"|"ACEITÁVEL"|"IMPRECISA"|"SEM REFERÊNCIA SUFICIENTE";
export type HandEvaluation={grade:DecisionGrade;confidence:number;recommended:string;frequencies:Partial<Record<PlayerAction,number>>;comment:string;math:string;source:string};
type Strategy={match:string[];frequencies:Partial<Record<PlayerAction,number>>;primary:PlayerAction[];secondary?:PlayerAction[];comment:string};

const STRATEGIES:Strategy[]=[
{match:["BTN VS BB","3-BET POT"],frequencies:{FOLD:12,CALL:58,RAISE:27,"ALL-IN":3},primary:["CALL"],secondary:["RAISE"],comment:"DEFESA DE 3-BET COM CALL DOMINANTE E RAISES POLARIZADOS."},
{match:["BLIND WAR","SB VS BB"],frequencies:{FOLD:8,CALL:37,RAISE:50,"ALL-IN":5},primary:["RAISE"],secondary:["CALL"],comment:"RANGES LARGOS DE BLIND WAR SUSTENTAM MAIS AGRESSÃO."},
{match:["CO VS BTN","SRP"],frequencies:{FOLD:5,CALL:68,RAISE:24,"ALL-IN":3},primary:["CALL"],secondary:["RAISE"],comment:"EM SRP OOP, CALL ABSORVE A MAIOR PARTE DAS MÃOS MÉDIAS."},
{match:["MULTIWAY","BB VS HJ VS BTN"],frequencies:{FOLD:24,CALL:62,RAISE:11,"ALL-IN":3},primary:["CALL"],secondary:["FOLD"],comment:"MULTIWAY REDUZ RAISES MARGINAIS E EXIGE MAIS EQUIDADE REALIZÁVEL."},
{match:["CO VS BB","2ND BARREL"],frequencies:{FOLD:31,CALL:57,RAISE:10,"ALL-IN":2},primary:["CALL"],secondary:["FOLD"],comment:"CONTRA SEGUNDO BARREL, BLUFF-CATCHERS PREFEREM CALL/FOLD A RAISE MARGINAL."},
{match:["BTN VS BB","THIN VALUE"],frequencies:{CHECK:34,BET:62,RAISE:3,"ALL-IN":1},primary:["BET"],secondary:["CHECK"],comment:"THIN VALUE EM POSIÇÃO USA BET CONTROLADO E CHECK DE PROTEÇÃO."},
{match:["BTN VS BB","OVERBET"],frequencies:{FOLD:39,CALL:56,RAISE:4,"ALL-IN":1},primary:["CALL"],secondary:["FOLD"],comment:"CONTRA OVERBET, A DEFESA FICA MAIS SELETIVA E RAISE É RARO."},
{match:["SIDE POT","CO VS BTN VS SB"],frequencies:{FOLD:4,CALL:39,RAISE:52,"ALL-IN":5},primary:["RAISE"],secondary:["CALL"],comment:"SIDE POT PERMITE PRESSÃO COM A PARTE FORTE DA FAIXA, NÃO COM AIR."},
{match:["EARLY GAME","UTG VS CO VS SB"],frequencies:{FOLD:5,CALL:24,RAISE:66,"ALL-IN":5},primary:["RAISE"],secondary:["CALL"],comment:"EARLY GAME PROFUNDO RESERVA RAISE PARA TOPO DE RANGE E BLUFFS COM BLOCKERS."},
{match:["MID GAME","BLIND WAR"],frequencies:{FOLD:9,CALL:33,RAISE:52,"ALL-IN":6},primary:["RAISE"],secondary:["CALL"],comment:"BLIND WAR MANTÉM FAIXAS LARGAS E PRESSÃO DE FOLD EQUITY."},
{match:["BOLHA","CO VS BTN"],frequencies:{FOLD:36,CALL:59,RAISE:4,"ALL-IN":1},primary:["CALL"],secondary:["FOLD"],comment:"ICM COMPRIME RAISES MARGINAIS E AUMENTA O CUSTO DE ERROS."},
{match:["ITM","BTN VS BB","COMBO DRAW"],frequencies:{FOLD:2,CALL:38,RAISE:55,"ALL-IN":5},primary:["RAISE"],secondary:["CALL"],comment:"COMBO DRAWS PODEM COMBINAR EQUIDADE E FOLD EQUITY."},
{match:["FT","MULTIWAY"],frequencies:{FOLD:61,CALL:34,RAISE:4,"ALL-IN":1},primary:["FOLD"],secondary:["CALL"],comment:"NA FT MULTIWAY, ICM REDUZ CONFRONTOS MARGINAIS."},
{match:["FT","SIDE POT","BTN VS SB VS BB"],frequencies:{FOLD:3,CALL:41,RAISE:51,"ALL-IN":5},primary:["RAISE"],secondary:["CALL"],comment:"EM SIDE POT DE FT, RAISE É PARA VALOR/DRAWS FORTES; MÃOS FRACAS DEVEM SAIR."},
{match:["BOLHA","BLUFF CATCH"],frequencies:{FOLD:54,CALL:42,RAISE:3,"ALL-IN":1},primary:["FOLD"],secondary:["CALL"],comment:"BLUFF-CATCHERS PERDEM VALOR SOB PRESSÃO DE ICM."},
{match:["MID GAME","BTN VS BB","IP"],frequencies:{CHECK:57,BET:38,RAISE:4,"ALL-IN":1},primary:["CHECK"],secondary:["BET"],comment:"CHECKS PRESERVAM SHOWDOWN; BETS DEPENDEM DE VANTAGEM DE RANGE/TEXTURA."}
];

function scenarioText(spot:PlayerDnaSpot){return spot.scenario.join(" / ").toUpperCase()}
function findStrategy(spot:PlayerDnaSpot){const text=scenarioText(spot);return STRATEGIES.find(s=>s.match.every(token=>text.includes(token)))}
function facingBet(spot:PlayerDnaSpot){const hero=spot.players.find(p=>p.hero);if(!hero)return null;const previous=spot.players.filter(p=>!p.hero&&p.value>0).map(p=>p.value);if(!previous.length)return null;const call=Math.max(...previous);return{call,pot:spot.pot.main}}
function mathNote(spot:PlayerDnaSpot){const facing=facingBet(spot);if(!facing||facing.call<=0)return"SEM CÁLCULO DE CALL NESTA DECISÃO.";const required=facing.call/(facing.pot+facing.call)*100;return`POT ODDS APROX.: ${required.toFixed(1)}% DE EQUIDADE MÍNIMA PARA CALL BREAK-EVEN, ANTES DE ICM/RAKE/REALIZAÇÃO.`}
function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n))}

function handAware(base:Partial<Record<PlayerAction,number>>,spot:PlayerDnaSpot){
 const p=profileHand(spot);const f:{[K in PlayerAction]?:number}={...base};const facing=Boolean(facingBet(spot));const text=scenarioText(spot);const multiway=text.includes("MULTIWAY")||spot.players.filter(x=>x.hero||x.action!=="FOLD").length>2;const icm=text.includes("ICM")||text.includes("BOLHA")||text.includes("FT");
 const add=(a:PlayerAction,d:number)=>{f[a]=Math.max(0,(f[a]??0)+d)};
 if(facing){
   if(p.equityClass==="AIR"){add("FOLD",55);add("CALL",-28);add("RAISE",-24);add("ALL-IN",-12)}
   else if(p.equityClass==="MARGINAL"){add("FOLD",28);add("CALL",4);add("RAISE",-20);add("ALL-IN",-10)}
   else if(p.equityClass==="DRAW"){add("CALL",16);add("RAISE",12);add("FOLD",-20);add("ALL-IN",-3)}
   else if(p.equityClass==="STRONG"){add("CALL",16);add("RAISE",10);add("FOLD",-24)}
   else if(p.equityClass==="MONSTER"){add("RAISE",30);add("CALL",8);add("FOLD",-40);add("ALL-IN",8)}
 }else{
   if(p.equityClass==="AIR"){add("CHECK",28);add("BET",-8);add("RAISE",-18)}
   if(p.equityClass==="STRONG"||p.equityClass==="MONSTER"){add("BET",24);add("RAISE",12);add("CHECK",-8)}
 }
 if(multiway){add("RAISE",-8);add("ALL-IN",-5);if(facing)add("FOLD",7)}
 if(icm&&p.equityClass!=="MONSTER"){add("FOLD",10);add("RAISE",-7);add("ALL-IN",-5)}
 if(p.gutshot&&!p.flushDraw&&!p.openEnded&&p.made==="HIGH_CARD"&&facing){add("FOLD",18);add("RAISE",-12);add("CALL",-5)}
 return normalizeFrequencies(f);
}

function actionOrder(freq:Partial<Record<PlayerAction,number>>){return (Object.entries(freq) as [PlayerAction,number][]).sort((a,b)=>b[1]-a[1])}
function recommendedLabel(spot:PlayerDnaSpot,action:PlayerAction){if(action!=="RAISE"&&action!=="BET")return action;const h=spot.players.find(p=>p.hero);const stack=h?.stack??100;if(spot.street==="PREFLOP")return `RAISE ${stack<=25?"2X":stack<=60?"2.5X":"3X"}`;return `RAISE ${stack<=35?"2X":"2.5X"}`}
function gradeFor(action:PlayerAction,freq:Partial<Record<PlayerAction,number>>){const selected=freq[action]??0;const top=Math.max(0,...Object.values(freq).map(v=>v??0));if(selected===top&&selected>=35)return"MELHOR LINHA" as const;if(selected>=18||top-selected<=12)return"ACEITÁVEL" as const;return"IMPRECISA" as const}

export function evaluateHandDecision(spot:PlayerDnaSpot,action:PlayerAction,sizing?:DecisionSizing|null):HandEvaluation{
 const strategy=findStrategy(spot);if(!strategy)return{grade:"SEM REFERÊNCIA SUFICIENTE",confidence:0,recommended:"---",frequencies:{},comment:"SPOT FORA DA COBERTURA CALIBRADA DO MOTOR.",math:mathNote(spot),source:"MOTOR GTO PLAYER DNA"};
 const frequencies=handAware(strategy.frequencies,spot);const order=actionOrder(frequencies);const best=order[0]?.[0]??strategy.primary[0];const recommended=recommendedLabel(spot,best);const grade=gradeFor(action,frequencies);const selected=sizing?`${action} ${sizing}`:action;const profile=profileHand(spot);const selectedFreq=frequencies[action]??0;const bestFreq=frequencies[best]??0;
 const confidence=clamp(90+(strategy.match.length>=3?2:1)+(profile.equityClass!=="MARGINAL"?1:0)+(bestFreq>=50?1:0),90,95);
 const handText=`MÃO ${profile.equityClass}${profile.comboDraw?" · COMBO DRAW":profile.flushDraw?" · FLUSH DRAW":profile.openEnded?" · OESD":profile.gutshot?" · GUTSHOT":""}.`;
 const comment=grade==="MELHOR LINHA"?`${selected}: LINHA PRINCIPAL (${selectedFreq}%). ${handText} ${strategy.comment}`:grade==="ACEITÁVEL"?`${selected}: LINHA PRESENTE NO MIX (${selectedFreq}%), MAS ${recommended} TEM MAIOR PESO (${bestFreq}%). ${handText}`:`${selected}: BAIXA FREQUÊNCIA (${selectedFreq}%). ${recommended} É A LINHA PRINCIPAL (${bestFreq}%). ${handText} ${strategy.comment}`;
 return{grade,confidence,recommended,frequencies,comment,math:mathNote(spot),source:"MOTOR GTO PLAYER DNA · RANGE + MÃO + BOARD + POT ODDS + ICM"};
}
