import type {PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";
import {lookupComboStrategy,strategyFromTexasSolverJson} from "@/lib/texassolver-strategy";

export type ExactSolverReference={
  kind:"TEXASSOLVER_EXACT_COMBO";
  validated:true;
  frequencies:Partial<Record<PlayerAction,number>>;
  nodeId?:string;
};
export type SolverReferencedSpot=PlayerDnaSpot&{solverReference?:ExactSolverReference};

function boardCards(spot:PlayerDnaSpot){return(spot.board??"").split(" ").filter(Boolean)}

export function attachTexasSolverReference(
  spot:PlayerDnaSpot,
  json:string|{actions?:string[];strategy?:Record<string,number[]>;childrens?:unknown;dealcards?:unknown},
  nodeId?:string,
):SolverReferencedSpot{
  const node=strategyFromTexasSolverJson(json,boardCards(spot));
  const combo=lookupComboStrategy(node,spot.heroCards);
  if(!combo)return{...spot};
  const allowed=new Set(spot.actions);const frequencies:Partial<Record<PlayerAction,number>>={};
  for(const [action,value] of Object.entries(combo.frequencies) as [PlayerAction,number][])if(allowed.has(action)&&value>0)frequencies[action]=value;
  if(!Object.keys(frequencies).length)return{...spot};
  return{...spot,solverReference:{kind:"TEXASSOLVER_EXACT_COMBO",validated:true,frequencies,nodeId}};
}

export function hasExactSolverReference(spot:PlayerDnaSpot):spot is SolverReferencedSpot&{solverReference:ExactSolverReference}{
  const ref=(spot as SolverReferencedSpot).solverReference;
  return Boolean(ref&&ref.kind==="TEXASSOLVER_EXACT_COMBO"&&ref.validated===true&&Object.keys(ref.frequencies).length);
}
