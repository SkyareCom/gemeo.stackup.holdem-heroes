import type {PlayerAction} from "@/data/player-dna-spots";

const RANKS=["2","3","4","5","6","7","8","9","T","J","Q","K","A"] as const;
const SUITS=["♠","♥","♦","♣"] as const;
const VALUE=Object.fromEntries(RANKS.map((rank,index)=>[rank,index+2])) as Record<string,number>;

export type WeightedCombo={cards:[string,string];handClass:string;weight:number};

function normalizeCard(card:string){
  return card.trim().replace(/s$/i,"♠").replace(/h$/i,"♥").replace(/d$/i,"♦").replace(/c$/i,"♣");
}
function className(a:string,b:string){
  const va=VALUE[a[0]]??0,vb=VALUE[b[0]]??0;
  if(va===vb)return `${a[0]}${b[0]}`;
  const hi=va>vb?a:b,lo=va>vb?b:a;
  return `${hi[0]}${lo[0]}${hi.slice(-1)===lo.slice(-1)?"S":"O"}`;
}
function pairClasses(start:string){const i=RANKS.indexOf(start as typeof RANKS[number]);return i<0?[]:RANKS.slice(i).map(rank=>`${rank}${rank}`)}
function plusClasses(hi:string,lo:string,suffix:"S"|"O"){
  const hiIndex=RANKS.indexOf(hi as typeof RANKS[number]),loIndex=RANKS.indexOf(lo as typeof RANKS[number]);
  if(hiIndex<0||loIndex<0)return[];
  const out:string[]=[];
  for(let i=loIndex;i<hiIndex;i++)out.push(`${hi}${RANKS[i]}${suffix}`);
  return out;
}
function expandToken(raw:string){
  const token=raw.trim().toUpperCase();if(!token)return[];
  const pairPlus=token.match(/^([2-9TJQKA])\1\+$/);if(pairPlus)return pairClasses(pairPlus[1]);
  const pair=token.match(/^([2-9TJQKA])\1$/);if(pair)return[token];
  const plus=token.match(/^([2-9TJQKA])([2-9TJQKA])(S|O)\+$/);if(plus)return plusClasses(plus[1],plus[2],plus[3] as "S"|"O");
  const exact=token.match(/^([2-9TJQKA])([2-9TJQKA])(S|O)$/);if(exact)return[token];
  return[];
}
function combosForClass(handClass:string){
  const pair=handClass.match(/^([2-9TJQKA])\1$/);
  if(pair){const rank=pair[1];const out:[string,string][]=[];for(let i=0;i<SUITS.length;i++)for(let j=i+1;j<SUITS.length;j++)out.push([`${rank}${SUITS[i]}`,`${rank}${SUITS[j]}`]);return out}
  const m=handClass.match(/^([2-9TJQKA])([2-9TJQKA])(S|O)$/);if(!m)return[];
  const [,hi,lo,kind]=m;const out:[string,string][]=[];
  for(const s1 of SUITS)for(const s2 of SUITS){if(kind==="S"&&s1!==s2)continue;if(kind==="O"&&s1===s2)continue;out.push([`${hi}${s1}`,`${lo}${s2}`])}return out;
}
function actionBias(handClass:string,action:PlayerAction){
  const pair=/^([2-9TJQKA])\1$/.test(handClass);const ranks=handClass.slice(0,2).split("").map(rank=>VALUE[rank]??0);const high=Math.max(...ranks);const suited=handClass.endsWith("S");
  if(action==="RAISE"||action==="BET"||action==="ALL-IN")return 1+(pair?.35:0)+(high>=13?.2:0)+(suited?.08:0);
  if(action==="CALL")return 1+(suited?.12:0)+(pair?.12:0);
  if(action==="FOLD")return 1+(high<=10?.15:0);
  return 1;
}

export function expandWeightedRange(rangeText:string,deadCards:string[]=[]):WeightedCombo[]{
  const source=rangeText.split("·")[0].trim();const classes=[...new Set(source.split(",").flatMap(expandToken))];const dead=new Set(deadCards.map(normalizeCard));const combos:WeightedCombo[]=[];
  for(const handClass of classes)for(const cards of combosForClass(handClass)){if(dead.has(cards[0])||dead.has(cards[1]))continue;combos.push({cards,handClass,weight:1})}
  return combos;
}

export function conditionRangeOnAction(range:WeightedCombo[],action:PlayerAction){
  const weighted=range.map(combo=>({...combo,weight:combo.weight*actionBias(combo.handClass,action)}));const total=weighted.reduce((sum,combo)=>sum+combo.weight,0)||1;return weighted.map(combo=>({...combo,weight:combo.weight/total}));
}

export function sampleWeightedCombo(range:WeightedCombo[],random:()=>number){
  if(!range.length)return null;const total=range.reduce((sum,combo)=>sum+combo.weight,0)||1;let roll=random()*total;for(const combo of range){roll-=combo.weight;if(roll<=0)return combo}return range[range.length-1];
}

export function comboKey(cards:[string,string]){return [...cards].sort().join(" ")}
