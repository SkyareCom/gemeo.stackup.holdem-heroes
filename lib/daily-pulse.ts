import type {DnaDevelopmentReport} from "./player-dna-report";
import type {StackupDailyPulseMessage,StackupDailyPulsePreference,StackupGameMode,StackupLeakExchange,StackupPlayerRef,StackupSpotExchange,StackupSource,StackupTrainingPrescription} from "./stackup-exchange";

export type DailyPulseCandidate={kind:StackupDailyPulseMessage["kind"];title:string;body:string;conceptTags:string[];leakTags:string[];trainingTags:string[];difficulty:number;source:StackupSource;sourceRecordId?:string|null;spot?:StackupSpotExchange|null;options?:{id:string;label:string}[];correctOptionId?:string|null;explanation?:string|null;priority:number};

const FACTS:DailyPulseCandidate[]=[
 {kind:"VOCE_SABIA",title:"VOCÊ SABIA?",body:"Com duas cartas do mesmo naipe, a chance de completar um flush usando as cinco cartas comunitárias é de aproximadamente 6,4%.",conceptTags:["FLUSH","PROBABILIDADE"],leakTags:[],trainingTags:["MATEMATICA"],difficulty:1,source:"AI_ASSISTANT",explanation:"Uma mão suited completa flush até o river em cerca de 6,4% das distribuições.",priority:10},
 {kind:"CONCEITO",title:"CONCEITO RÁPIDO",body:"Pot odds transformam o preço do call em uma porcentagem. Compare essa porcentagem com a equity necessária antes de decidir.",conceptTags:["POT_ODDS","EQUITY"],leakTags:[],trainingTags:["MATEMATICA"],difficulty:2,source:"AI_ASSISTANT",priority:9},
];

export function candidatesFromPlayerDna(report:DnaDevelopmentReport,analysisId:string):DailyPulseCandidate[]{
 const weakness=report.weaknesses.map((w,i)=>({kind:"REVISAO_LEAK" as const,title:"REVISÃO DE LEAK",body:`${w.title}: ${w.why}`,conceptTags:[w.trainingTag],leakTags:[w.title],trainingTags:[w.trainingTag],difficulty:w.severity==="ALTA"?4:w.severity==="MEDIA"?3:2,source:"PLAYER_DNA" as const,sourceRecordId:analysisId,explanation:`Treino recomendado: ${w.trainingTag}.`,priority:100-i*5}));
 const checklist=report.checklist.filter(i=>i.status!=="CONCLUÍDO").map((item,i)=>({kind:"CONCEITO" as const,title:"FOCO DE EVOLUÇÃO",body:item.reason,conceptTags:[item.trainingTag],leakTags:[],trainingTags:[item.trainingTag],difficulty:item.priority==="ALTA"?4:3,source:"PLAYER_DNA" as const,sourceRecordId:analysisId,priority:75-i}));
 return [...weakness,...checklist];
}

export function candidatesFromExchange(input:{spots?:StackupSpotExchange[];leaks?:StackupLeakExchange[];prescriptions?:StackupTrainingPrescription[]}):DailyPulseCandidate[]{
 const leaks=(input.leaks??[]).filter(l=>l.status!=="RESOLVIDO").map((l,i)=>({kind:"REVISAO_LEAK" as const,title:"REVISÃO DE LEAK",body:`${l.title}: ${l.description}`,conceptTags:l.trainingTags,leakTags:[l.title],trainingTags:l.trainingTags,difficulty:l.severity==="ALTA"?4:l.severity==="MEDIA"?3:2,source:"IMPORTED" as const,sourceRecordId:l.id,priority:95-i}));
 const spots=(input.spots??[]).filter(s=>s.expectedAction||s.acceptedActions?.length).map((s,i)=>({kind:"SPOT_RAPIDO" as const,title:"SPOT RÁPIDO",body:spotPrompt(s),conceptTags:s.conceptTags??[],leakTags:s.leakTags,trainingTags:s.trainingTags,difficulty:s.difficulty??3,source:s.source,sourceRecordId:s.id,spot:s,options:actionOptions(s),correctOptionId:correctOption(s),explanation:s.expectedAction?`A ação de referência é ${s.expectedAction}.`:null,priority:90-i}));
 const prescriptions=(input.prescriptions??[]).filter(p=>p.status!=="CONCLUIDO").map((p,i)=>({kind:"CONCEITO" as const,title:"TREINO RECOMENDADO",body:`${p.title}: ${p.reason}`,conceptTags:p.conceptTags??[],leakTags:p.leakId?[p.leakId]:[],trainingTags:p.trainingTags,difficulty:p.difficultyMin??3,source:p.createdBy,sourceRecordId:p.id,priority:80-i}));
 return [...leaks,...spots,...prescriptions];
}

export function buildDailyPulseQueue(args:{player:StackupPlayerRef;preference:StackupDailyPulsePreference;candidates:DailyPulseCandidate[];now?:number;recentTags?:string[]}):StackupDailyPulseMessage[]{
 const now=args.now??Date.now();const pref=args.preference;if(!pref.enabled)return[];
 const allowed=[...args.candidates,...FACTS].filter(c=>pref.kinds.includes(c.kind)).filter(c=>(pref.difficultyMin==null||c.difficulty>=pref.difficultyMin)&&(pref.difficultyMax==null||c.difficulty<=pref.difficultyMax));
 const recent=new Set(args.recentTags??[]);allowed.sort((a,b)=>score(b,pref,recent)-score(a,pref,recent));
 const selected:DailyPulseCandidate[]=[];const used=new Set<string>();for(const c of allowed){const key=[...c.leakTags,...c.trainingTags,...c.conceptTags][0]??c.title;if(used.has(key))continue;selected.push(c);used.add(key);if(selected.length>=pref.deliveriesPerDay)break}
 return selected.map((c,i)=>({id:`pulse-${now}-${i}`,player:args.player,kind:c.kind,channel:pref.channels[0]??"IN_APP",source:c.source,sourceRecordId:c.sourceRecordId,title:c.title,body:c.body,spot:c.spot,options:c.options,correctOptionId:c.correctOptionId,explanation:c.explanation,conceptTags:c.conceptTags,leakTags:c.leakTags,trainingTags:c.trainingTags,difficulty:c.difficulty,scheduledFor:scheduleAt(pref,i,now),requiresResponse:c.kind==="SPOT_RAPIDO"||c.kind==="QUIZ"||c.kind==="REVISAO_LEAK"}));
}

function score(c:DailyPulseCandidate,p:StackupDailyPulsePreference,recent:Set<string>){let n=c.priority;if(p.prioritizeLeaks&&c.leakTags.length)n+=30;if(p.spacedRepetition&&c.kind==="REVISAO_LEAK")n+=15;if([...c.leakTags,...c.trainingTags,...c.conceptTags].some(t=>recent.has(t)))n-=25;return n}
function scheduleAt(p:StackupDailyPulsePreference,index:number,now:number){const raw=p.preferredTimes?.[index];if(!raw)return now+(index+1)*60*60*1000;const [h,m]=raw.split(":").map(Number);const d=new Date(now);d.setHours(Number.isFinite(h)?h:12,Number.isFinite(m)?m:0,0,0);if(d.getTime()<now)d.setDate(d.getDate()+1);return d.getTime()}
function spotPrompt(s:StackupSpotExchange){const hero=(s.context?.heroCards??s.heroCards??[]).join(" ");const board=(s.context?.board??s.board??[]).join(" ");const pos=s.context?.heroPosition??s.heroPosition??"HERO";return `${s.mode} · ${s.street} · ${pos}${hero?` · ${hero}`:""}${board?` · BOARD ${board}`:""}. Qual é a melhor ação?`}
function actionOptions(s:StackupSpotExchange){const values=[...(s.acceptedActions??[]),...(s.expectedAction?[s.expectedAction]:[]),"FOLD","CALL","RAISE","ALL-IN"].filter((v,i,a)=>v&&a.indexOf(v)===i).slice(0,4);return values.map((label,i)=>({id:String.fromCharCode(65+i),label}))}
function correctOption(s:StackupSpotExchange){if(!s.expectedAction)return null;const opts=actionOptions(s);return opts.find(o=>o.label===s.expectedAction)?.id??null}
