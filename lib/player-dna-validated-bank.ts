import type {GameMode,PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";
import {getExactSolverReference,solverSpotFingerprint,type SolverReferencedSpot} from "@/lib/player-dna-solver-reference";
import {validatedTexasSolverNodes,type ValidatedTexasSolverNode} from "@/lib/validated-texassolver-nodes";

const SUITS=["s","h","d","c"] as const;
const GLYPH:Record<string,string>={s:"♠",h:"♥",d:"♦",c:"♣"};

type Suit=typeof SUITS[number];

function hashText(value:string){let hash=2166136261;for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619)}return hash>>>0}
function rng(seed:number){let state=(seed||1)>>>0;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296}}
function allPermutations<T>(items:T[]):T[][]{if(items.length<=1)return[items];const out:T[][]=[];items.forEach((item,index)=>{const rest=[...items.slice(0,index),...items.slice(index+1)];for(const tail of allPermutations(rest))out.push([item,...tail])});return out}
const SUIT_PERMUTATIONS=allPermutations<Suit>([...SUITS]);
function permutation(index:number){const chosen=SUIT_PERMUTATIONS[((index%SUIT_PERMUTATIONS.length)+SUIT_PERMUTATIONS.length)%SUIT_PERMUTATIONS.length];return new Map<Suit,Suit>(SUITS.map((s,i)=>[s,chosen[i]]))}
function card(card:string,map:Map<Suit,Suit>){const rank=card.slice(0,-1),suit=card.slice(-1) as Suit;return`${rank}${GLYPH[map.get(suit)??suit]??suit}`}
function cards(text:string,map:Map<Suit,Suit>){return text.split(" ").filter(Boolean).map(value=>card(value,map)).join(" ")}
function modeOf(node:ValidatedTexasSolverNode):GameMode{return node.id.startsWith("mtt-")?"TORNEIO":"CASH"}
function positions(node:ValidatedTexasSolverNode){const match=node.id.match(/-(bb|sb|btn|co|hj|lj|mp|utg)-vs-(bb|sb|btn|co|hj|lj|mp|utg)-/i);if(match)return{hero:match[1].toUpperCase(),villain:match[2].toUpperCase()};return node.positionState==="IP"?{hero:"BTN",villain:"BB"}:{hero:"BB",villain:"BTN"}}
function legalActions(node:ValidatedTexasSolverNode):PlayerAction[]{if(node.facingValue>0)return node.facingValue>=node.effectiveStack?["FOLD","CALL"]:["FOLD","CALL","RAISE","ALL-IN"];return["CHECK","BET","ALL-IN"]}

export function spotFromValidatedNode(node:ValidatedTexasSolverNode,seed=1,variant=0):SolverReferencedSpot{
  const suitMap=permutation(variant+hashText(node.id)+seed);const pos=positions(node);const mode=modeOf(node);const allIn=node.facingValue>0&&node.facingValue>=node.effectiveStack;
  const base:PlayerDnaSpot={
    id:`validated-${node.id}-${seed.toString(36)}-${variant.toString(36)}`,
    mode,
    ...(mode==="TORNEIO"?{gameProfile:"MTT REGULAR" as const,anteMode:"NONE" as const}:{}),
    street:node.street,
    heroCards:cards(node.hero,suitMap),
    board:cards(node.board,suitMap),
    players:[
      {position:pos.hero,stack:node.effectiveStack,action:"---",value:0,hero:true},
      {position:pos.villain,stack:node.effectiveStack,action:node.facingValue>0?(allIn?"ALL-IN":node.facingAction):"CHECK",value:node.facingValue},
    ],
    pot:{main:Math.round((node.rootPot+node.facingValue)*100)/100},
    scenario:[mode,node.potType,node.positionState,"HU","SOLVER VALIDATED"],
    prompt:`${pos.villain} ${node.facingValue>0?(allIn?"ALL-IN":node.facingAction):"CHECK"}. HERO EM ${pos.hero}. QUAL É A MELHOR DECISÃO?`,
    actions:legalActions(node),
    weights:{},
  };
  return{...base,solverReference:{kind:"TEXASSOLVER_EXACT_COMBO",validated:true,frequencies:{...node.frequencies},spotFingerprint:solverSpotFingerprint(base),nodeId:node.id}};
}

export function buildValidatedSolverBank(mode?:GameMode,seed=1,variantsPerNode=1){
  const nodes=mode?validatedTexasSolverNodes.filter(node=>modeOf(node)===mode):validatedTexasSolverNodes;
  const variants=Math.max(1,Math.min(SUIT_PERMUTATIONS.length,Math.floor(variantsPerNode)));
  const spots:SolverReferencedSpot[]=[];
  for(const node of nodes)for(let variant=0;variant<variants;variant++)spots.push(spotFromValidatedNode(node,seed,variant));
  return spots;
}

export function validatedSolverBankCapacity(mode?:GameMode){const nodes=mode?validatedTexasSolverNodes.filter(node=>modeOf(node)===mode):validatedTexasSolverNodes;return nodes.length*SUIT_PERMUTATIONS.length}

export function buildValidatedSolverSession(mode:GameMode,count:number,seed=Date.now(),excludedFingerprints:Iterable<string>=[]){
  const requested=Math.max(0,Math.floor(count));
  const excluded=new Set(excludedFingerprints);const candidates=buildValidatedSolverBank(mode,seed,SUIT_PERMUTATIONS.length);const random=rng(hashText(`${mode}:${seed}:${requested}`));
  for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]]}
  const spots:SolverReferencedSpot[]=[];const seen=new Set<string>();
  for(const spot of candidates){const ref=getExactSolverReference(spot);if(!ref||excluded.has(ref.spotFingerprint)||seen.has(ref.spotFingerprint))continue;seen.add(ref.spotFingerprint);spots.push(spot);if(spots.length>=requested)break}
  return{spots,requested,capacity:validatedSolverBankCapacity(mode),availableAfterHistory:Math.max(0,validatedSolverBankCapacity(mode)-excluded.size),coveragePct:spots.length===requested?100:Math.round((spots.length/Math.max(1,requested))*10000)/100};
}
