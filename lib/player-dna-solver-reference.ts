import type {PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";
import {lookupComboStrategy,strategyFromTexasSolverJson} from "@/lib/texassolver-strategy";

export type ExactSolverReference={
  kind:"TEXASSOLVER_EXACT_COMBO";
  validated:true;
  frequencies:Partial<Record<PlayerAction,number>>;
  spotFingerprint:string;
  nodeId?:string;
};
export type SolverReferencedSpot=PlayerDnaSpot&{solverReference?:ExactSolverReference};

function boardCards(spot:PlayerDnaSpot){return(spot.board??"").split(" ").filter(Boolean)}
function normalizedHeroCards(cards:string){return cards.split(" ").filter(Boolean).sort().join(" ")}
function n(value:number){return Number.isFinite(value)?Math.round(value*1000)/1000:0}

export function solverSpotFingerprint(spot:PlayerDnaSpot){
  const players=spot.players.map(player=>({position:player.position,stack:n(player.stack),action:String(player.action).toUpperCase(),value:n(player.value),hero:Boolean(player.hero)}));
  const sides=(spot.pot.sides??[]).map(side=>({value:n(side.value),players:[...side.players].sort()}));
  return JSON.stringify({mode:spot.mode,gameProfile:spot.gameProfile??null,anteMode:spot.anteMode??null,street:spot.street,heroCards:normalizedHeroCards(spot.heroCards),board:boardCards(spot),players,pot:{main:n(spot.pot.main),sides},actions:[...spot.actions]});
}

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
  return{...spot,solverReference:{kind:"TEXASSOLVER_EXACT_COMBO",validated:true,frequencies,spotFingerprint:solverSpotFingerprint(spot),nodeId}};
}

export function getExactSolverReference(spot:PlayerDnaSpot):ExactSolverReference|null{
  const ref=(spot as SolverReferencedSpot).solverReference;
  if(!ref||ref.kind!=="TEXASSOLVER_EXACT_COMBO"||ref.validated!==true||!Object.keys(ref.frequencies).length)return null;
  if(ref.spotFingerprint!==solverSpotFingerprint(spot))return null;
  return ref;
}

export function hasExactSolverReference(spot:PlayerDnaSpot):spot is SolverReferencedSpot&{solverReference:ExactSolverReference}{return Boolean(getExactSolverReference(spot))}
