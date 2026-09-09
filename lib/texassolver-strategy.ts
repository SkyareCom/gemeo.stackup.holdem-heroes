import type {PlayerAction} from "@/data/player-dna-spots";

export type SolverComboStrategy={combo:string;frequencies:Partial<Record<PlayerAction,number>>};
export type SolverStrategyNode={actions:string[];combos:Map<string,SolverComboStrategy>};

type RawNode={actions?:string[];strategy?:Record<string,number[]>;childrens?:unknown;dealcards?:unknown};

const SUIT_MAP:Record<string,string>={s:"♠",h:"♥",d:"♦",c:"♣",S:"♠",H:"♥",D:"♦",C:"♣"};
function normalizeCard(card:string){const value=card.trim();if(value.length<2)return value;const rank=value[0].toUpperCase(),suit=SUIT_MAP[value.slice(-1)]??value.slice(-1);return `${rank}${suit}`}
function splitCombo(raw:string){
  const text=raw.replace(/[ ,|/_-]+/g,"").trim();
  const cards=text.match(/(?:10|[2-9TJQKA])[shdc♠♥♦♣]/gi)??[];
  return cards.slice(0,2).map(normalizeCard);
}
function comboKey(cards:string[]){return [...cards].sort().join(" ")}
function mapAction(raw:string):PlayerAction|null{
  const action=raw.toUpperCase();
  if(action.includes("FOLD"))return"FOLD";if(action.includes("CHECK"))return"CHECK";if(action.includes("CALL"))return"CALL";
  if(action.includes("ALLIN")||action.includes("ALL-IN")||action.includes("JAM"))return"ALL-IN";
  if(action.includes("RAISE"))return"RAISE";if(action.includes("BET"))return"BET";return null;
}
function normalizeFrequencies(values:Partial<Record<PlayerAction,number>>){
  const entries=Object.entries(values) as [PlayerAction,number][];const total=entries.reduce((sum,[,v])=>sum+Math.max(0,v),0);if(total<=0)return{};
  const out:Partial<Record<PlayerAction,number>>={};for(const [action,value] of entries)out[action]=Math.round(value*10000/total)/100;return out;
}

export function parseTexasSolverNode(raw:RawNode,boardCards:string[]=[]):SolverStrategyNode{
  const actions=raw.actions??[];const dead=new Set(boardCards.map(normalizeCard));const combos=new Map<string,SolverComboStrategy>();
  for(const [rawCombo,vector] of Object.entries(raw.strategy??{})){
    const cards=splitCombo(rawCombo);if(cards.length!==2||cards[0]===cards[1]||cards.some(card=>dead.has(card)))continue;
    const merged:Partial<Record<PlayerAction,number>>={};
    actions.forEach((label,index)=>{const action=mapAction(label);if(!action)return;merged[action]=(merged[action]??0)+Math.max(0,Number(vector[index]??0))});
    const frequencies=normalizeFrequencies(merged);if(Object.keys(frequencies).length)combos.set(comboKey(cards),{combo:comboKey(cards),frequencies});
  }
  return{actions,combos};
}

export function lookupComboStrategy(node:SolverStrategyNode,heroCards:string){
  const cards=heroCards.split(" ").filter(Boolean).map(normalizeCard);if(cards.length!==2)return null;return node.combos.get(comboKey(cards))??null;
}

export function strategyFromTexasSolverJson(json:string|RawNode,boardCards:string[]=[]){const raw=typeof json==="string"?JSON.parse(json) as RawNode:json;return parseTexasSolverNode(raw,boardCards)}
