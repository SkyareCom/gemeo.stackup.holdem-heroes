import type {AnteFormat,GameMode,PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";
import {sampleSolverAction,solverActionLabel,solverNodePolicy} from "@/lib/gto-range-policy";

type Street=PlayerDnaSpot["street"];
type PriorAnswer={action:PlayerAction};
type StackBand="SHORT"|"MEDIUM"|"DEEP";
type Heads="HEADS-UP"|"MULTIWAY";
type PositionState="IP"|"OOP";
type PotType="LIMPED"|"SRP"|"3BET"|"4BET"|"OTHER";
type Theme="VALUE"|"BLUFF"|"BLUFF-CATCH"|"BLIND-WAR"|"SQUEEZE"|"ALL-IN"|"DRAW"|"PRESSURE"|"STANDARD";
type Texture="PREFLOP"|"DRY"|"WET"|"PAIRED"|"MONOTONE"|"CONNECTED";
type Sizing="SMALL"|"MEDIUM"|"LARGE"|"OVERBET"|"NONE";

export type SpotDimensions={street:Street;heroPosition:string;stackBand:StackBand;heads:Heads;positionState:PositionState;potType:PotType;theme:Theme;texture:Texture;sizing:Sizing;tournamentPhase:"EARLY"|"MID"|"BUBBLE"|"ITM"|"FT"|"NA";icm:boolean;ante:boolean;gameProfile:string;anteMode:AnteFormat};

const SUITS=["♠","♥","♦","♣"];
function hashText(value:string){let hash=2166136261;for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619)}return hash>>>0}
function randomFrom(seed:number){let state=(seed||1)>>>0;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296}}
function has(spot:PlayerDnaSpot,text:string){return spot.scenario.some(item=>item.toUpperCase().includes(text))}
function hero(spot:PlayerDnaSpot){return spot.players.find(player=>player.hero)??spot.players[0]}
function round(value:number,mode:GameMode){return mode==="TORNEIO"?Math.max(.1,Math.round(value*10)/10):Math.max(1,Math.round(value))}
function stableShuffle<T>(items:T[],seed:number){const out=[...items];const random=randomFrom(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}

function suitPermutation(random:()=>number){const suits=[...SUITS];for(let i=suits.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[suits[i],suits[j]]=[suits[j],suits[i]]}return new Map(SUITS.map((s,i)=>[s,suits[i]]))}
function remapCard(card:string,map:Map<string,string>){if(!card)return card;const rank=card.slice(0,-1),suit=card.slice(-1);return `${rank}${map.get(suit)??suit}`}
function remapCards(text:string|undefined,map:Map<string,string>){if(!text)return undefined;return text.split(" ").filter(Boolean).map(card=>remapCard(card,map)).join(" ")}

export function describeSpot(spot:PlayerDnaSpot):SpotDimensions{
  const h=hero(spot);const board=(spot.board??"").split(" ").filter(Boolean);const boardRanks=board.map(card=>card[0]);const boardSuits=board.map(card=>card.slice(1));const maxAction=Math.max(0,...spot.players.filter(player=>!player.hero).map(player=>player.value));const ratio=maxAction/(spot.pot.main||1);const paired=new Set(boardRanks).size<boardRanks.length;const monotone=boardSuits.length>=3&&new Set(boardSuits).size===1;
  return{street:spot.street,heroPosition:h.position,stackBand:h.stack<=30?"SHORT":h.stack<=80?"MEDIUM":"DEEP",heads:spot.players.filter(player=>player.hero||player.action!=="FOLD").length>2?"MULTIWAY":"HEADS-UP",positionState:has(spot,"OOP")?"OOP":"IP",potType:has(spot,"4-BET")?"4BET":has(spot,"3-BET")?"3BET":has(spot,"LIMP")?"LIMPED":has(spot,"SRP")?"SRP":"OTHER",theme:has(spot,"BLUFF CATCH")?"BLUFF-CATCH":has(spot,"VALUE")?"VALUE":has(spot,"BLIND WAR")?"BLIND-WAR":has(spot,"SQUEEZE")?"SQUEEZE":spot.players.some(player=>player.action==="ALL-IN")?"ALL-IN":has(spot,"DRAW")||has(spot,"COMBO")?"DRAW":has(spot,"ICM")||has(spot,"BOLHA")?"PRESSURE":"STANDARD",texture:spot.street==="PREFLOP"?"PREFLOP":paired?"PAIRED":monotone?"MONOTONE":has(spot,"DRAW")||has(spot,"COMBO")?"WET":"DRY",sizing:maxAction===0?"NONE":ratio<=.33?"SMALL":ratio<=.7?"MEDIUM":ratio<=1?"LARGE":"OVERBET",tournamentPhase:has(spot,"EARLY")?"EARLY":has(spot,"MID")?"MID":has(spot,"BOLHA")?"BUBBLE":has(spot,"ITM")?"ITM":has(spot,"FT")?"FT":"NA",icm:has(spot,"ICM"),ante:has(spot,"ANTE"),gameProfile:spot.gameProfile??spot.mode,anteMode:spot.anteMode??"NONE"};
}

function generatedPrompt(players:Array<{position:string;action:string;value:number;hero?:boolean}>,heroPosition:string){
  const villains=players.filter(p=>!p.hero).map(p=>`${p.position} ${p.action}${p.value>0?` ${p.value}`:""}`).join(" · ");
  return `AÇÃO ATÉ O HERÓI: ${villains}. HERO EM ${heroPosition}. QUAL É A MELHOR DECISÃO?`;
}

function makeVariant(template:PlayerDnaSpot,slot:number,sessionSeed:number,answers:PriorAnswer[]):PlayerDnaSpot{
  const adaptation=answers.slice(-6).map(answer=>answer.action).join("|")||"START";const random=randomFrom(hashText(`${template.id}:${sessionSeed}:${slot}:${adaptation}`));
  // Preserve rank/board relationships from the calibrated seed. Suit isomorphism changes appearance
  // without turning a solved value/draw class into an unrelated hand.
  const suitMap=suitPermutation(random);const heroCards=remapCards(template.heroCards,suitMap)??template.heroCards;const board=remapCards(template.board,suitMap);
  const stackFactor=.90+random()*.20;const valueFactor=.92+random()*.16;
  const hasSidePots=Boolean(template.pot.sides?.length);
  const templateVillainCommitted=template.players.filter(player=>!player.hero).reduce((sum,player)=>sum+Math.max(0,player.value),0);
  const players=template.players.map(player=>{
    const stack=round(player.stack*stackFactor,template.mode);
    if(player.hero)return{...player,stack,value:round(Math.max(0,player.value)*valueFactor,template.mode),action:"---"};

    // Side-pot templates are structurally sensitive: changing one participant's action can invalidate
    // the main/side-pot composition. Preserve those actions and vary only stacks/suits/amount scale.
    if(hasSidePots){
      const value=round(Math.max(0,player.value)*valueFactor,template.mode);
      return{...player,stack,value};
    }

    const policy=solverNodePolicy(template,player.position,player.action);const sampled=sampleSolverAction(policy,random);const action=solverActionLabel(sampled,player.action);
    const templateValue=player.value>0?round(player.value*valueFactor,template.mode):0;
    const value=sampled==="CHECK"||sampled==="FOLD"?0:sampled==="ALL-IN"?stack:templateValue>0?templateValue:round(template.pot.main*(sampled==="BET"?.5:.75),template.mode);
    return{...player,stack,value,action,rangeProfile:policy.range,solverActionFrequency:policy.actions[sampled]??0,solverNodeSource:policy.source};
  });

  const scaledTemplatePot=round(template.pot.main*valueFactor,template.mode);
  const newVillainCommitted=players.filter(player=>!player.hero).reduce((sum,player)=>sum+Math.max(0,player.value),0);
  const scaledOldCommitted=round(templateVillainCommitted*valueFactor,template.mode);
  const commitmentDelta=hasSidePots?0:newVillainCommitted-scaledOldCommitted;
  const mainPot=round(Math.max(0.1,scaledTemplatePot+commitmentDelta),template.mode);
  const pot={main:mainPot,...(template.pot.sides?.length?{sides:template.pot.sides.map(side=>({...side,value:round(side.value*valueFactor,template.mode)}))}:{})};
  const h=players.find(player=>player.hero)??players[0];
  return{...template,id:`${template.id}-${sessionSeed.toString(36)}-${slot.toString(36)}-${hashText(adaptation).toString(36)}`,heroCards,board,players,pot,prompt:generatedPrompt(players,h.position),scenario:[...template.scenario]};
}

export function buildBalancedSpotSession(bank:PlayerDnaSpot[],mode:GameMode,count:number,seed=Date.now(),answers:PriorAnswer[]=[]):PlayerDnaSpot[]{
  if(count<=0)return[];const seeds=bank.filter(spot=>spot.mode===mode);if(!seeds.length)return[];const ordered=stableShuffle(seeds,seed);const output:PlayerDnaSpot[]=[];const recentTemplateIds=new Set<string>();
  for(let slot=0;slot<count;slot++){const prior=answers.slice(0,slot);let template=ordered[(slot+hashText(prior.map(answer=>answer.action).join("|")))%ordered.length];if(recentTemplateIds.has(template.id)&&ordered.length>1)template=ordered[(ordered.indexOf(template)+1)%ordered.length];const generated=makeVariant(template,slot,seed,prior);output.push(generated);recentTemplateIds.add(template.id);if(recentTemplateIds.size>Math.min(4,ordered.length))recentTemplateIds.clear()}
  return output;
}
