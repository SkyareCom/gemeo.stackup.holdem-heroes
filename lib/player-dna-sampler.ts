import type {GameMode,PlayerDnaSpot} from "@/data/player-dna-spots";

type Street=PlayerDnaSpot["street"];
type StackBand="SHORT"|"MEDIUM"|"DEEP";
type Heads="HEADS-UP"|"MULTIWAY";
type PositionState="IP"|"OOP";
type PotType="LIMPED"|"SRP"|"3BET"|"4BET"|"OTHER";
type Theme="VALUE"|"BLUFF"|"BLUFF-CATCH"|"BLIND-WAR"|"SQUEEZE"|"ALL-IN"|"DRAW"|"PRESSURE"|"STANDARD";
type Texture="PREFLOP"|"DRY"|"WET"|"PAIRED"|"MONOTONE"|"CONNECTED";
type Sizing="SMALL"|"MEDIUM"|"LARGE"|"OVERBET"|"NONE";

export type SpotDimensions={
  street:Street;
  heroPosition:string;
  stackBand:StackBand;
  heads:Heads;
  positionState:PositionState;
  potType:PotType;
  theme:Theme;
  texture:Texture;
  sizing:Sizing;
  tournamentPhase:"EARLY"|"MID"|"BUBBLE"|"ITM"|"FT"|"NA";
  icm:boolean;
  ante:boolean;
};

const stackMultipliers=[0.72,0.86,1,1.16,1.34];
const potMultipliers=[0.78,0.9,1,1.12,1.26];
const betMultipliers=[0.67,0.82,1,1.22,1.5];

function round(value:number,mode:GameMode){return mode==="TORNEIO"?Math.round(value*10)/10:Math.max(1,Math.round(value));}
function has(spot:PlayerDnaSpot,text:string){return spot.scenario.some(x=>x.toUpperCase().includes(text));}
function hero(spot:PlayerDnaSpot){return spot.players.find(p=>p.hero)??spot.players[0];}

export function describeSpot(spot:PlayerDnaSpot):SpotDimensions{
  const h=hero(spot);
  const maxAction=Math.max(0,...spot.players.filter(p=>!p.hero).map(p=>p.value));
  const stack=h.stack;
  const board=(spot.board??"").split(" ").filter(Boolean);
  const ranks=board.map(c=>c[0]);
  const suits=board.map(c=>c.slice(1));
  const paired=new Set(ranks).size<ranks.length;
  const monotone=suits.length>=3&&new Set(suits).size===1;
  const connected=board.length>=3&&/([TJQK9].*){2}/.test(board.join(""));
  const wet=has(spot,"DRAW")||has(spot,"COMBO")||monotone||connected;
  const pot=spot.pot.main||1;
  const ratio=maxAction/pot;
  return {
    street:spot.street,
    heroPosition:h.position,
    stackBand:stack<=30?"SHORT":stack<=80?"MEDIUM":"DEEP",
    heads:spot.players.length>2?"MULTIWAY":"HEADS-UP",
    positionState:has(spot,"OOP")?"OOP":"IP",
    potType:has(spot,"4-BET")?"4BET":has(spot,"3-BET")?"3BET":has(spot,"LIMP")?"LIMPED":has(spot,"SRP")?"SRP":"OTHER",
    theme:has(spot,"BLUFF CATCH")?"BLUFF-CATCH":has(spot,"THIN VALUE")||has(spot,"VALUE")?"VALUE":has(spot,"BLIND WAR")?"BLIND-WAR":has(spot,"SQUEEZE")?"SQUEEZE":spot.players.some(p=>p.action==="ALL-IN")?"ALL-IN":has(spot,"DRAW")?"DRAW":has(spot,"ICM")||has(spot,"BOLHA")?"PRESSURE":"STANDARD",
    texture:spot.street==="PREFLOP"?"PREFLOP":paired?"PAIRED":monotone?"MONOTONE":wet?"WET":"DRY",
    sizing:maxAction===0?"NONE":ratio<=0.33?"SMALL":ratio<=0.7?"MEDIUM":ratio<=1?"LARGE":"OVERBET",
    tournamentPhase:has(spot,"EARLY")?"EARLY":has(spot,"MID")?"MID":has(spot,"BOLHA")?"BUBBLE":has(spot,"ITM")?"ITM":has(spot,"FT")?"FT":"NA",
    icm:has(spot,"ICM"),
    ante:has(spot,"ANTE")
  };
}

function variant(seed:PlayerDnaSpot,n:number):PlayerDnaSpot{
  const sm=stackMultipliers[n%stackMultipliers.length];
  const pm=potMultipliers[Math.floor(n/stackMultipliers.length)%potMultipliers.length];
  const bm=betMultipliers[Math.floor(n/(stackMultipliers.length*potMultipliers.length))%betMultipliers.length];
  const players=seed.players.map(p=>({
    ...p,
    stack:round(p.stack*sm,seed.mode),
    value:p.value===0?0:round(p.value*bm,seed.mode),
    action:p.hero?"---":p.action
  }));
  const main=round(seed.pot.main*pm,seed.mode);
  const sides=seed.pot.sides?.map(s=>({...s,value:round(s.value*pm,seed.mode)}));
  return {...seed,id:`${seed.id}-v${n}`,players,pot:{main,sides}};
}

function stableShuffle<T>(items:T[],seed:number){
  const out=[...items];
  let x=(seed||1)>>>0;
  for(let i=out.length-1;i>0;i--){x=(x*1664525+1013904223)>>>0;const j=x%(i+1);[out[i],out[j]]=[out[j],out[i]];}
  return out;
}

function keyEntries(d:SpotDimensions){return [
  `street:${d.street}`,`pos:${d.heroPosition}`,`stack:${d.stackBand}`,`heads:${d.heads}`,
  `state:${d.positionState}`,`pot:${d.potType}`,`theme:${d.theme}`,`texture:${d.texture}`,
  `sizing:${d.sizing}`,`phase:${d.tournamentPhase}`,`icm:${d.icm}`,`ante:${d.ante}`
];}

export function buildBalancedSpotSession(bank:PlayerDnaSpot[],mode:GameMode,count:number,seed=Date.now()):PlayerDnaSpot[]{
  const seeds=bank.filter(s=>s.mode===mode);
  if(!seeds.length||count<=0)return [];
  const expanded:PlayerDnaSpot[]=[];
  const variantsPerSeed=Math.max(32,Math.ceil(count/seeds.length)*3);
  seeds.forEach(s=>{for(let n=0;n<variantsPerSeed;n++)expanded.push(variant(s,n));});
  const pool=stableShuffle(expanded,seed);
  const selected:PlayerDnaSpot[]=[];
  const counts=new Map<string,number>();
  const remaining=[...pool];
  while(selected.length<count&&remaining.length){
    let bestIndex=0,bestScore=Infinity;
    const sampleLimit=Math.min(remaining.length,180);
    for(let i=0;i<sampleLimit;i++){
      const keys=keyEntries(describeSpot(remaining[i]));
      const score=keys.reduce((sum,k)=>sum+(counts.get(k)??0),0);
      if(score<bestScore){bestScore=score;bestIndex=i;if(score===0)break;}
    }
    const [pick]=remaining.splice(bestIndex,1);
    selected.push(pick);
    keyEntries(describeSpot(pick)).forEach(k=>counts.set(k,(counts.get(k)??0)+1));
  }
  return stableShuffle(selected,seed^0x9e3779b9);
}
