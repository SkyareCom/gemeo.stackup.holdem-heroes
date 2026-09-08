import type {AnteFormat,GameMode,PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";

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

const ranks=["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const suits=["♠","♥","♦","♣"];
const deck=ranks.flatMap(rank=>suits.map(suit=>`${rank}${suit}`));

function hashText(value:string){let hash=2166136261;for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619)}return hash>>>0}
function randomFrom(seed:number){let state=(seed||1)>>>0;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296}}
function has(spot:PlayerDnaSpot,text:string){return spot.scenario.some(item=>item.toUpperCase().includes(text))}
function hero(spot:PlayerDnaSpot){return spot.players.find(player=>player.hero)??spot.players[0]}
function round(value:number,mode:GameMode){return mode==="TORNEIO"?Math.max(.1,Math.round(value*10)/10):Math.max(1,Math.round(value))}
function stableShuffle<T>(items:T[],seed:number){const out=[...items];const random=randomFrom(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function deal(count:number,random:()=>number,excluded:string[]=[]){const cards=deck.filter(card=>!excluded.includes(card));const out:string[]=[];while(out.length<count&&cards.length){const index=Math.floor(random()*cards.length);out.push(cards.splice(index,1)[0])}return out}

export function describeSpot(spot:PlayerDnaSpot):SpotDimensions{
  const h=hero(spot);
  const board=(spot.board??"").split(" ").filter(Boolean);
  const boardRanks=board.map(card=>card[0]);
  const boardSuits=board.map(card=>card.slice(1));
  const maxAction=Math.max(0,...spot.players.filter(player=>!player.hero).map(player=>player.value));
  const ratio=maxAction/(spot.pot.main||1);
  const paired=new Set(boardRanks).size<boardRanks.length;
  const monotone=boardSuits.length>=3&&new Set(boardSuits).size===1;
  return{
    street:spot.street,
    heroPosition:h.position,
    stackBand:h.stack<=30?"SHORT":h.stack<=80?"MEDIUM":"DEEP",
    heads:spot.players.filter(player=>player.hero||player.action!=="FOLD").length>2?"MULTIWAY":"HEADS-UP",
    positionState:has(spot,"OOP")?"OOP":"IP",
    potType:has(spot,"4-BET")?"4BET":has(spot,"3-BET")?"3BET":has(spot,"LIMP")?"LIMPED":has(spot,"SRP")?"SRP":"OTHER",
    theme:has(spot,"BLUFF CATCH")?"BLUFF-CATCH":has(spot,"VALUE")?"VALUE":has(spot,"BLIND WAR")?"BLIND-WAR":has(spot,"SQUEEZE")?"SQUEEZE":spot.players.some(player=>player.action==="ALL-IN")?"ALL-IN":has(spot,"DRAW")||has(spot,"COMBO")?"DRAW":has(spot,"ICM")||has(spot,"BOLHA")?"PRESSURE":"STANDARD",
    texture:spot.street==="PREFLOP"?"PREFLOP":paired?"PAIRED":monotone?"MONOTONE":has(spot,"DRAW")||has(spot,"COMBO")?"WET":"DRY",
    sizing:maxAction===0?"NONE":ratio<=.33?"SMALL":ratio<=.7?"MEDIUM":ratio<=1?"LARGE":"OVERBET",
    tournamentPhase:has(spot,"EARLY")?"EARLY":has(spot,"MID")?"MID":has(spot,"BOLHA")?"BUBBLE":has(spot,"ITM")?"ITM":has(spot,"FT")?"FT":"NA",
    icm:has(spot,"ICM"),
    ante:has(spot,"ANTE"),
    gameProfile:spot.gameProfile??spot.mode,
    anteMode:spot.anteMode??"NONE"
  };
}

function makeVariant(template:PlayerDnaSpot,slot:number,sessionSeed:number,answers:PriorAnswer[]):PlayerDnaSpot{
  const adaptation=answers.slice(-6).map(answer=>answer.action).join("|")||"START";
  const random=randomFrom(hashText(`${template.id}:${sessionSeed}:${slot}:${adaptation}`));
  const boardCount=template.street==="PREFLOP"?0:template.street==="FLOP"?3:template.street==="TURN"?4:5;
  const heroCards=deal(2,random);
  const board=boardCount?deal(boardCount,random,heroCards).join(" "):undefined;
  const stackFactor=.82+random()*.36;
  const valueFactor=.86+random()*.28;
  const players=template.players.map(player=>({
    ...player,
    stack:round(player.stack*stackFactor,template.mode),
    value:player.value>0?round(player.value*valueFactor,template.mode):0,
    action:player.hero?"---":player.action
  }));
  const pot={
    main:round(template.pot.main*valueFactor,template.mode),
    ...(template.pot.sides?.length?{sides:template.pot.sides.map(side=>({...side,value:round(side.value*valueFactor,template.mode)}))}:{})
  };
  const h=players.find(player=>player.hero)??players[0];
  return{
    ...template,
    id:`${template.id}-${sessionSeed.toString(36)}-${slot.toString(36)}-${hashText(adaptation).toString(36)}`,
    heroCards:heroCards.join(" "),
    board,
    players,
    pot,
    prompt:`${template.prompt} HERO EM ${h.position}.`,
    scenario:[...template.scenario]
  };
}

export function buildBalancedSpotSession(bank:PlayerDnaSpot[],mode:GameMode,count:number,seed=Date.now(),answers:PriorAnswer[]=[]):PlayerDnaSpot[]{
  if(count<=0)return[];
  const seeds=bank.filter(spot=>spot.mode===mode);
  if(!seeds.length)return[];
  const ordered=stableShuffle(seeds,seed);
  const output:PlayerDnaSpot[]=[];
  const recentTemplateIds=new Set<string>();
  for(let slot=0;slot<count;slot++){
    const prior=answers.slice(0,slot);
    let template=ordered[(slot+hashText(prior.map(answer=>answer.action).join("|")))%ordered.length];
    if(recentTemplateIds.has(template.id)&&ordered.length>1){template=ordered[(ordered.indexOf(template)+1)%ordered.length]}
    const generated=makeVariant(template,slot,seed,prior);
    output.push(generated);
    recentTemplateIds.add(template.id);
    if(recentTemplateIds.size>Math.min(4,ordered.length))recentTemplateIds.clear();
  }
  return output;
}
