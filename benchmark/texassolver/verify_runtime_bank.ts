import fs from "node:fs";
import {buildExactComboSession,exactComboBankCapacity,type ExactComboBank} from "../../lib/player-dna-exact-combo-session";
import {getExactSolverReference} from "../../lib/player-dna-solver-reference";
import {evaluateHandDecision} from "../../lib/player-dna-hand-evaluator";
import type {PlayerAction} from "../../data/player-dna-spots";

const path=process.argv[2]??"data/texassolver-runtime-bank.json";
const bank=JSON.parse(fs.readFileSync(path,"utf8")) as ExactComboBank;
if(bank.nodeCount!==32)throw new Error(`expected 32 nodes, got ${bank.nodeCount}`);
if(bank.exactComboDecisionCount<6456)throw new Error(`expected >=6456 combo decisions, got ${bank.exactComboDecisionCount}`);
if(bank.rejectedBoardCollisionCombos!==0)throw new Error(`board collisions: ${bank.rejectedBoardCollisionCombos}`);
const capacities={CASH:exactComboBankCapacity(bank,"CASH"),TORNEIO:exactComboBankCapacity(bank,"TORNEIO"),TOTAL:exactComboBankCapacity(bank)};
if(capacities.CASH<3000||capacities.TORNEIO<3000)throw new Error(`insufficient capacity ${JSON.stringify(capacities)}`);
const actions:PlayerAction[]=["FOLD","CHECK","CALL","BET","RAISE","ALL-IN"];
for(const mode of ["CASH","TORNEIO","ALEATORIO"] as const){
  const result=buildExactComboSession(bank,mode,3000,20260910);
  if(result.coveragePct!==100||result.spots.length!==3000)throw new Error(`${mode} coverage ${result.coveragePct}`);
  if(new Set(result.keys).size!==result.keys.length)throw new Error(`${mode} duplicate keys`);
  const ids=new Set<string>(),fingerprints=new Set<string>();
  for(const spot of result.spots){
    if(ids.has(spot.id))throw new Error(`${mode} duplicate id ${spot.id}`);ids.add(spot.id);
    const ref=getExactSolverReference(spot);if(!ref)throw new Error(`${mode} invalid exact reference ${spot.id}`);
    if(fingerprints.has(ref.spotFingerprint))throw new Error(`${mode} duplicate fingerprint ${spot.id}`);fingerprints.add(ref.spotFingerprint);
    const heroCards=spot.heroCards.split(" ").filter(Boolean),board=(spot.board??"").split(" ").filter(Boolean);
    if(new Set([...heroCards,...board]).size!==heroCards.length+board.length)throw new Error(`${mode} card collision ${spot.id}`);
    const total=actions.reduce((sum,a)=>sum+(ref.frequencies[a]??0),0);
    if(Math.abs(total-100)>.15)throw new Error(`${mode} frequency sum ${total} ${spot.id}`);
    const positive=actions.filter(a=>(ref.frequencies[a]??0)>0);
    if(spot.actions.length!==positive.length||positive.some(a=>!spot.actions.includes(a)))throw new Error(`${mode} non-solver action exposed ${spot.id}`);
    for(const a of actions)if((ref.frequencies[a]??0)>0&&!spot.actions.includes(a))throw new Error(`${mode} missing legal action ${a} ${spot.id}`);
    const best=positive.sort((a,b)=>(ref.frequencies[b]??0)-(ref.frequencies[a]??0))[0];
    if(!best)throw new Error(`${mode} missing best action ${spot.id}`);
    const plain=evaluateHandDecision(spot,best,null);
    const sized=evaluateHandDecision(spot,best,"4X");
    if(plain.grade!==sized.grade||plain.recommended!==sized.recommended)throw new Error(`${mode} heuristic sizing leaked into exact solver grade ${spot.id}`);
    if(/\s(?:25%|33%|50%|66%|75%|POT|125%|150%|2X|2\.5X|3X|4X|SQUEEZE)$/.test(plain.recommended))throw new Error(`${mode} heuristic sizing exposed as exact recommendation ${spot.id}`);
  }
}
console.log(JSON.stringify({verified:true,nodeCount:bank.nodeCount,exactComboDecisionCount:bank.exactComboDecisionCount,rejectedBoardCollisionCombos:bank.rejectedBoardCollisionCombos,capacities,sessionTestSize:3000,exactActionLeakage:false,heuristicSizingLeakage:false},null,2));
