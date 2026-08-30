import type {StackupExchangeEnvelope,StackupLeakExchange,StackupTrainingPrescription} from "./stackup-exchange";

export const STACKUP_EVOLUTION_STORE_KEY="stackup.evolution.library.v1";
export const LEGACY_HAND_REVIEW_KEY="stackup.hand-review.library.v1";

export type StackupEvolutionRecord={id:string;source:"PLAYER_DNA"|"HAND_REVIEW"|"TRAINING_APP"|"IMPORTED";title:string;createdAt:number;envelope:StackupExchangeEnvelope};
export type StackupEvolutionLibrary={version:1;records:StackupEvolutionRecord[]};
const emptyLibrary:StackupEvolutionLibrary={version:1,records:[]};

export function readEvolutionLibrary(storage:Pick<Storage,"getItem">=localStorage):StackupEvolutionLibrary{try{const raw=storage.getItem(STACKUP_EVOLUTION_STORE_KEY);if(!raw)return emptyLibrary;const parsed=JSON.parse(raw) as Partial<StackupEvolutionLibrary>;return{version:1,records:Array.isArray(parsed.records)?parsed.records.filter(validRecord).sort((a,b)=>b.createdAt-a.createdAt):[]}}catch{return emptyLibrary}}
export function writeEvolutionLibrary(library:StackupEvolutionLibrary,storage:Pick<Storage,"setItem">=localStorage){storage.setItem(STACKUP_EVOLUTION_STORE_KEY,JSON.stringify({version:1,records:dedupe(library.records).sort((a,b)=>b.createdAt-a.createdAt).slice(0,500)}))}
export function upsertEvolutionEnvelope(envelope:StackupExchangeEnvelope,source:StackupEvolutionRecord["source"],title:string,storage:Storage=localStorage){const current=readEvolutionLibrary(storage);const id=envelope.analyses?.[0]?.id??envelope.trainingResults?.[0]?.id??envelope.spots?.[0]?.sourceRecordId??envelope.spots?.[0]?.id??`${source}-${envelope.exportedAt}`;const record:StackupEvolutionRecord={id,source,title,createdAt:envelope.exportedAt,envelope};writeEvolutionLibrary({version:1,records:[record,...current.records.filter(row=>row.id!==id)]},storage);return record}
export function importLegacyHandReviews(storage:Storage=localStorage){let changed=false;const current=readEvolutionLibrary(storage);let legacy:unknown[]=[];try{const raw=storage.getItem(LEGACY_HAND_REVIEW_KEY);const parsed=raw?JSON.parse(raw):[];legacy=Array.isArray(parsed)?parsed:[]}catch{}const rows=[...current.records];for(const item of legacy){if(!isEnvelope(item))continue;const id=item.spots?.[0]?.sourceRecordId??item.spots?.[0]?.id??`HAND_REVIEW-${item.exportedAt}`;if(rows.some(row=>row.id===id))continue;rows.push({id,source:"HAND_REVIEW",title:handReviewTitle(item),createdAt:item.exportedAt,envelope:item});changed=true}if(changed)writeEvolutionLibrary({version:1,records:rows},storage);return changed}

export function evolutionSummary(library:StackupEvolutionLibrary){
 const records=[...library.records].sort((a,b)=>b.createdAt-a.createdAt);
 const leaks=latestById(records.flatMap(record=>(record.envelope.leaks??[]).map(value=>({value,at:record.createdAt}))));
 const prescriptions=latestById(records.flatMap(record=>(record.envelope.prescriptions??[]).map(value=>({value,at:record.createdAt}))));
 const trainingResults=latestById(records.flatMap(record=>(record.envelope.trainingResults??[]).map(value=>({value,at:record.createdAt}))));
 const activeLeaks=leaks.filter(row=>row.status!=="RESOLVIDO");const resolvedLeaks=leaks.filter(row=>row.status==="RESOLVIDO");const pendingTraining=prescriptions.filter(row=>row.status!=="CONCLUIDO");const completedTraining=trainingResults;
 const playerDna=records.filter(row=>row.source==="PLAYER_DNA").length;const handReviews=records.filter(row=>row.source==="HAND_REVIEW").length;const trainingSessions=records.reduce((sum,row)=>sum+(row.envelope.trainingSessions?.length??0),0);
 return{records:records.length,playerDna,handReviews,trainingSessions,activeLeaks,resolvedLeaks,pendingTraining,completedTraining,latest:records[0]??null}
}
export function topLeakTags(leaks:StackupLeakExchange[],limit=5){const counts=new Map<string,number>();for(const leak of leaks)for(const tag of leak.trainingTags)counts.set(tag,(counts.get(tag)??0)+1);return[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit)}
export function pendingByPriority(rows:StackupTrainingPrescription[]){const weight={ALTA:3,MEDIA:2,BAIXA:1};return[...rows].sort((a,b)=>weight[b.priority]-weight[a.priority]||a.createdAt-b.createdAt)}
function latestById<T extends{id:string}>(rows:{value:T;at:number}[]){const map=new Map<string,{value:T;at:number}>();for(const row of rows){const current=map.get(row.value.id);if(!current||row.at>current.at)map.set(row.value.id,row)}return[...map.values()].sort((a,b)=>b.at-a.at).map(row=>row.value)}
function isEnvelope(value:unknown):value is StackupExchangeEnvelope{if(!value||typeof value!=="object")return false;const row=value as Partial<StackupExchangeEnvelope>;return typeof row.exchangeVersion==="string"&&typeof row.exportedAt==="number"&&typeof row.producer==="string"&&!!row.player}
function validRecord(value:unknown):value is StackupEvolutionRecord{if(!value||typeof value!=="object")return false;const row=value as Partial<StackupEvolutionRecord>;return typeof row.id==="string"&&typeof row.createdAt==="number"&&!!row.envelope}
function dedupe(rows:StackupEvolutionRecord[]){const seen=new Set<string>();return rows.filter(row=>{if(seen.has(row.id))return false;seen.add(row.id);return true})}
function handReviewTitle(envelope:StackupExchangeEnvelope){const spot=envelope.spots?.[0];if(!spot)return"ANÁLISE DE MÃO";return`MÃO · ${spot.mode} · ${spot.street}${spot.heroPosition?` · ${spot.heroPosition}`:""}`}
