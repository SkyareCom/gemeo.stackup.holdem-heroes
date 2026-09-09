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

export type SolverNodePolicy={
  range:string;
  actions:Partial<Record<PlayerAction,number>>;
  source:"PREFLOP_RANGE_MATRIX"|"POSTFLOP_SOLVER_NODE";
};

function cards(text?:string){return (text??"").split(" ").filter(Boolean)}
function rank(card:string){return card.slice(0,-1)}
function suit(card:string){return card.slice(-1)}
function handClass(heroCards:string){const [a,b]=cards(heroCards);if(!a||!b)return"";const ra=rank(a),rb=rank(b),va=RANK_VALUE[ra]??0,vb=RANK_VALUE[rb]??0;const hi=va>=vb?ra:rb,lo=va>=vb?rb:ra;if(ra===rb)return `${ra}${rb}`;return `${hi}${lo}${suit(a)===suit(b)?"S":"O"}`}
function scenarioText(spot:PlayerDnaSpot){return spot.scenario.join(" ").toUpperCase()}
function activeVillains(spot:PlayerDnaSpot){return spot.players.filter(player=>!player.hero&&player.action!=="FOLD")}
function isAggressive(action:string){const a=action.toUpperCase();return ["BET","RAISE","3-BET","4-BET","SQUEEZE","OVERBET","ALL-IN"].some(token=>a.includes(token))}
function isIcm(spot:PlayerDnaSpot){const text=scenarioText(spot);return text.includes("ICM")||text.includes("BOLHA")||text.includes("FT")}
function isMultiway(spot:PlayerDnaSpot){return scenarioText(spot).includes("MULTIWAY")||activeVillains(spot).length>1}

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

function preflopBaseRange(position:string,tight:boolean,stack:number){
  const p=position.toUpperCase();
  if(stack<=15)return tight?"77+,AJS+,AQO+,KQS":"55+,A9S+,AT0+,KQS,KJS,QJS";
  if(["UTG","UTG1","UTG2"].includes(p))return tight?"88+,AJS+,AQO+,KQS":"77+,ATS+,AJO+,KQS,KJS,QJS";
  if(["MP1","MP2","LJ","HJ"].includes(p))return tight?"77+,ATS+,AQO+,KQS":"66+,A9S+,AT0+,KJS+,QJS,JTS";
  if(p==="CO")return tight?"66+,A9S+,AT0+,KJS+,QJS,JTS":"44+,A5S+,A8O+,K9S+,KTO+,Q9S+,J9S+,T9S";
  if(p==="BTN")return tight?"55+,A7S+,A9O+,KTS+,KQO,QTS+,JTS":"22+,A2S+,A7O+,K7S+,K9O+,Q8S+,QTO+,J8S+,T8S+,98S";
  return tight?"66+,A8S+,AT0+,KTS+,QTS+,JTS":"22+,A2S+,A8O+,K7S+,KTO+,Q8S+,J8S+,T8S+,98S";
}

export function solverInspiredVillainRange(spot:PlayerDnaSpot,position:string,action:string){
  const tight=isIcm(spot);const aggressive=isAggressive(action);const late=["BTN","CO","SB","BB"].includes(position.toUpperCase());const stack=spot.players.find(p=>p.position===position)?.stack??100;
  const base=spot.street==="PREFLOP"?preflopBaseRange(position,tight,stack):(tight?(late?"TT+,AQS+,AKO":"JJ+,AKS,AKO"):(late?"66+,A8S+,KTS+,QTS+,JTS,AT0+,KQO":"88+,ATS+,KQS,AQO+"));
  return aggressive?`${base} · AGRESSÃO PONDERADA POR VALOR + BLUFFS COM BLOCKERS/DRAWS`:base;
}

export function normalizeFrequencies(entries:Partial<Record<PlayerAction,number>>){
  const keys=(Object.keys(entries) as PlayerAction[]).filter(k=>(entries[k]??0)>0);const total=keys.reduce((s,k)=>s+(entries[k]??0),0)||1;const out:Partial<Record<PlayerAction,number>>={};let used=0;keys.forEach((k,i)=>{const v=i===keys.length-1?100-used:Math.max(0,Math.round((entries[k]??0)*100/total));out[k]=v;used+=v});return out;
}

function compatibleVillainActions(templateAction:string,street:PlayerDnaSpot["street"]){
  const a=templateAction.toUpperCase();
  if(a.includes("ALL-IN"))return street==="PREFLOP"?["RAISE","ALL-IN"] as PlayerAction[]:["BET","RAISE","ALL-IN"] as PlayerAction[];
  if(a.includes("3-BET")||a.includes("4-BET")||a.includes("SQUEEZE")||a.includes("RAISE"))return ["RAISE","ALL-IN"] as PlayerAction[];
  if(a.includes("OVERBET")||a.includes("BET"))return ["BET","ALL-IN"] as PlayerAction[];
  if(a.includes("CALL"))return ["CALL","RAISE"] as PlayerAction[];
  if(a.includes("CHECK"))return ["CHECK","BET"] as PlayerAction[];
  return ["CHECK","BET"] as PlayerAction[];
}

export function solverNodePolicy(spot:PlayerDnaSpot,position:string,templateAction:string):SolverNodePolicy{
  const stack=spot.players.find(p=>p.position===position)?.stack??100;const tight=isIcm(spot);const multiway=isMultiway(spot);const allowed=compatibleVillainActions(templateAction,spot.street);let base:Partial<Record<PlayerAction,number>>;
  if(spot.street==="PREFLOP"){
    if(allowed.includes("RAISE"))base=stack<=15?{RAISE:38,"ALL-IN":62}:tight?{RAISE:78,"ALL-IN":22}:{RAISE:88,"ALL-IN":12};
    else if(allowed.includes("CALL"))base=tight?{CALL:84,RAISE:16}:{CALL:76,RAISE:24};
    else base={CHECK:72,BET:28};
  }else if(allowed.includes("BET")){
    base=spot.street==="FLOP"?{BET:92,"ALL-IN":8}:spot.street==="TURN"?{BET:88,"ALL-IN":12}:{BET:84,"ALL-IN":16};
  }else if(allowed.includes("RAISE")){
    base={RAISE:multiway?82:88,"ALL-IN":multiway?18:12};
  }else if(allowed.includes("CALL")){
    base={CALL:multiway?86:78,RAISE:multiway?14:22};
  }else{
    base=spot.street==="FLOP"?{CHECK:68,BET:32}:spot.street==="TURN"?{CHECK:73,BET:27}:{CHECK:79,BET:21};
  }
  if(tight&&base["ALL-IN"]){base["ALL-IN"]=Math.max(1,(base["ALL-IN"]??0)-6);if(base.RAISE)base.RAISE+=6;if(base.BET)base.BET+=6}
  return{range:solverInspiredVillainRange(spot,position,templateAction),actions:normalizeFrequencies(base),source:spot.street==="PREFLOP"?"PREFLOP_RANGE_MATRIX":"POSTFLOP_SOLVER_NODE"};
}

export function sampleSolverAction(policy:SolverNodePolicy,random:()=>number):PlayerAction{
  const entries=Object.entries(policy.actions) as [PlayerAction,number][];const roll=random()*100;let acc=0;for(const [action,frequency] of entries){acc+=frequency;if(roll<=acc)return action}return entries[0]?.[0]??"CHECK";
}

export function solverActionLabel(sampled:PlayerAction,templateAction:string){
  const t=templateAction.toUpperCase();
  if(sampled==="RAISE"){if(t.includes("4-BET"))return"4-BET";if(t.includes("3-BET"))return"3-BET";if(t.includes("SQUEEZE"))return"SQUEEZE";return"RAISE"}
  if(sampled==="BET"&&t.includes("OVERBET"))return"OVERBET";
  return sampled;
}

export function solverHeroNodeStrategy(spot:PlayerDnaSpot){
  const profile=profileHand(spot);const facing=activeVillains(spot).some(v=>v.value>0||isAggressive(v.action));const icm=isIcm(spot);const multiway=isMultiway(spot);let f:Partial<Record<PlayerAction,number>>={};
  if(spot.street==="PREFLOP"){
    if(profile.tier==="PREMIUM")f={FOLD:1,CALL:20,RAISE:64,"ALL-IN":15};
    else if(profile.tier==="STRONG")f={FOLD:12,CALL:51,RAISE:32,"ALL-IN":5};
    else if(profile.tier==="MEDIUM")f={FOLD:38,CALL:44,RAISE:16,"ALL-IN":2};
    else f={FOLD:78,CALL:17,RAISE:4,"ALL-IN":1};
  }else if(facing){
    if(profile.equityClass==="MONSTER")f={FOLD:1,CALL:21,RAISE:63,"ALL-IN":15};
    else if(profile.equityClass==="STRONG")f={FOLD:7,CALL:55,RAISE:34,"ALL-IN":4};
    else if(profile.equityClass==="DRAW")f={FOLD:14,CALL:49,RAISE:32,"ALL-IN":5};
    else if(profile.equityClass==="MARGINAL")f={FOLD:61,CALL:34,RAISE:4,"ALL-IN":1};
    else f={FOLD:86,CALL:10,RAISE:3,"ALL-IN":1};
  }else{
    if(profile.equityClass==="MONSTER")f={CHECK:14,BET:76,"ALL-IN":10};
    else if(profile.equityClass==="STRONG")f={CHECK:34,BET:62,"ALL-IN":4};
    else if(profile.equityClass==="DRAW")f={CHECK:42,BET:54,"ALL-IN":4};
    else if(profile.equityClass==="MARGINAL")f={CHECK:62,BET:37,"ALL-IN":1};
    else f={CHECK:76,BET:23,"ALL-IN":1};
  }
  if(multiway){if(f.RAISE)f.RAISE=Math.max(0,f.RAISE-8);if(f.BET)f.BET=Math.max(0,f.BET-7);if(f.FOLD)f.FOLD+=5;if(f.CALL)f.CALL+=3;if(f.CHECK)f.CHECK+=7}
  if(icm&&profile.equityClass!=="MONSTER"&&profile.tier!=="PREMIUM"){if(f.FOLD)f.FOLD+=10;if(f.RAISE)f.RAISE=Math.max(0,f.RAISE-6);if(f["ALL-IN"])f["ALL-IN"]=Math.max(0,(f["ALL-IN"]??0)-4)}
  const allowed=new Set(spot.actions);const filtered:Partial<Record<PlayerAction,number>>={};(Object.entries(f) as [PlayerAction,number][]).forEach(([a,v])=>{if(allowed.has(a))filtered[a]=v});
  return normalizeFrequencies(Object.keys(filtered).length?filtered:f);
}
