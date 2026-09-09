import type {PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";

const RANK_VALUE:Record<string,number>={"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,T:10,J:11,Q:12,K:13,A:14};
const PREFLOP_PREMIUM=["AA","KK","QQ","AKS","AKO","JJS","JJ","AQS"];
const PREFLOP_STRONG=["TT","99","AJS","AQO","KQS","ATS","KJS","QJS"];
const PREFLOP_MEDIUM=["88","77","66","A9S","A8S","KTS","QTS","JTS","T9S","98S"];

export type HandProfile={
  tier:"PREMIUM"|"STRONG"|"MEDIUM"|"WEAK";
  made:"QUADS"|"FULL_HOUSE"|"FLUSH"|"STRAIGHT"|"TRIPS"|"TWO_PAIR"|"PAIR"|"HIGH_CARD";
  pairRank:number;
  topPair:boolean;
  overpair:boolean;
  flushDraw:boolean;
  openEnded:boolean;
  gutshot:boolean;
  comboDraw:boolean;
  equityClass:"MONSTER"|"STRONG"|"DRAW"|"MARGINAL"|"AIR";
};

function cards(text?:string){return (text??"").split(" ").filter(Boolean)}
function rank(card:string){return card.slice(0,-1)}
function suit(card:string){return card.slice(-1)}
function handClass(heroCards:string){const [a,b]=cards(heroCards);if(!a||!b)return"";const ra=rank(a),rb=rank(b),va=RANK_VALUE[ra]??0,vb=RANK_VALUE[rb]??0;const hi=va>=vb?ra:rb,lo=va>=vb?rb:ra;if(ra===rb)return `${ra}${rb}`;return `${hi}${lo}${suit(a)===suit(b)?"S":"O"}`}

function hasStraight(values:number[]){const unique=[...new Set(values)].sort((a,b)=>a-b);if(unique.includes(14))unique.unshift(1);for(let i=0;i<=unique.length-5;i++)if(unique[i+4]-unique[i]===4)return true;return false}
function straightDraw(values:number[]){const unique=[...new Set(values)];if(unique.includes(14))unique.push(1);const set=new Set(unique);let openEnded=false,gutshot=false;for(let start=1;start<=10;start++){let hits=0;for(let v=start;v<start+5;v++)if(set.has(v))hits++;if(hits===4){const missing=[start,start+1,start+2,start+3,start+4].find(v=>!set.has(v));if(missing===start||missing===start+4)openEnded=true;else gutshot=true}}return{openEnded,gutshot}}

export function profileHand(spot:PlayerDnaSpot):HandProfile{
  const hero=cards(spot.heroCards),board=cards(spot.board),all=[...hero,...board];
  const rankCounts=new Map<string,number>(),suitCounts=new Map<string,number>();
  all.forEach(c=>{rankCounts.set(rank(c),(rankCounts.get(rank(c))??0)+1);suitCounts.set(suit(c),(suitCounts.get(suit(c))??0)+1)});
  const counts=[...rankCounts.entries()].sort((a,b)=>b[1]-a[1]||(RANK_VALUE[b[0]]??0)-(RANK_VALUE[a[0]]??0));
  const values=all.map(c=>RANK_VALUE[rank(c)]??0);
  const straight=hasStraight(values),flush=Math.max(0,...suitCounts.values())>=5;
  const groups=counts.map(([,n])=>n);
  const made:HandProfile["made"]=groups[0]===4?"QUADS":groups[0]===3&&groups[1]>=2?"FULL_HOUSE":flush?"FLUSH":straight?"STRAIGHT":groups[0]===3?"TRIPS":groups.filter(n=>n>=2).length>=2?"TWO_PAIR":groups[0]===2?"PAIR":"HIGH_CARD";
  const boardTop=Math.max(0,...board.map(c=>RANK_VALUE[rank(c)]??0));
  const heroValues=hero.map(c=>RANK_VALUE[rank(c)]??0);
  const pairRank=counts.find(([,n])=>n>=2)?.[0];
  const pairValue=pairRank?RANK_VALUE[pairRank]??0:0;
  const topPair=made==="PAIR"&&pairValue===boardTop&&hero.some(c=>rank(c)===pairRank);
  const overpair=hero.length===2&&rank(hero[0])===rank(hero[1])&&(RANK_VALUE[rank(hero[0])]??0)>boardTop;
  const flushDraw=!flush&&Math.max(0,...suitCounts.values())===4;
  const draw=straightDraw(values);
  const comboDraw=flushDraw&&(draw.openEnded||draw.gutshot);
  const hc=handClass(spot.heroCards);
  let tier:HandProfile["tier"]="WEAK";
  if(PREFLOP_PREMIUM.includes(hc))tier="PREMIUM";else if(PREFLOP_STRONG.includes(hc))tier="STRONG";else if(PREFLOP_MEDIUM.includes(hc))tier="MEDIUM";
  if(spot.street!=="PREFLOP"){
    if(["QUADS","FULL_HOUSE","FLUSH","STRAIGHT","TRIPS","TWO_PAIR"].includes(made)||overpair)tier="PREMIUM";
    else if(topPair||comboDraw)tier="STRONG";
    else if(made==="PAIR"||flushDraw||draw.openEnded)tier="MEDIUM";
  }
  const equityClass:HandProfile["equityClass"]=["QUADS","FULL_HOUSE","FLUSH","STRAIGHT","TRIPS","TWO_PAIR"].includes(made)||overpair?"MONSTER":topPair?"STRONG":comboDraw||flushDraw||draw.openEnded?"DRAW":made==="PAIR"||draw.gutshot?"MARGINAL":"AIR";
  return{tier,made,pairRank:pairValue,topPair,overpair,flushDraw,openEnded:draw.openEnded,gutshot:draw.gutshot,comboDraw,equityClass};
}

export function solverInspiredVillainRange(spot:PlayerDnaSpot,position:string,action:string){
  const text=spot.scenario.join(" ").toUpperCase();
  const tight=text.includes("FT")||text.includes("BOLHA")||text.includes("ICM");
  const aggressive=["RAISE","3-BET","4-BET","SQUEEZE","ALL-IN","BET","OVERBET"].some(a=>action.toUpperCase().includes(a));
  const late=["BTN","CO","SB","BB"].includes(position);
  const base=tight?(late?"TT+,AQS+,AKO":"JJ+,AKS,AKO"):(late?"66+,A8S+,KTS+,QTS+,JTS,AT0+,KQO":"88+,ATS+,KQS,AQO+");
  return aggressive?`${base} · POLARIZADO COM BLUFFS DE BLOCKER/DRAWS`:base;
}

export function normalizeFrequencies(entries:Partial<Record<PlayerAction,number>>){
  const keys=Object.keys(entries) as PlayerAction[];const total=keys.reduce((s,k)=>s+(entries[k]??0),0)||1;const out:Partial<Record<PlayerAction,number>>={};let used=0;keys.forEach((k,i)=>{const v=i===keys.length-1?100-used:Math.max(0,Math.round((entries[k]??0)*100/total));out[k]=v;used+=v});return out;
}
