import type {PlayerDnaAnswer,PlayerDnaResult} from "@/lib/player-dna";
import type {GameMode,PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";

export type DnaScores=PlayerDnaResult["scores"];
export type ChecklistStatus="PENDENTE"|"EM ESTUDO"|"CONCLUÍDO";
export type DnaChecklistItem={id:string;title:string;reason:string;priority:"ALTA"|"MÉDIA"|"BAIXA";status:ChecklistStatus;dueAt:number|null;trainingTag:string};
export type DnaEvidence={label:string;count:number;total:number;percent:number;spotIds:string[];explanation:string};
export type DnaWeakness={title:string;severity:"ALTA"|"MÉDIA"|"BAIXA";why:string;trainingTag:string};
export type DnaDevelopmentReport={
  archetype:string;
  secondaryArchetype:string;
  confidence:number;
  confidenceLabel:"BAIXA"|"MÉDIA"|"ALTA";
  confidenceReason:string;
  actionStats:Record<PlayerAction,number>;
  streetStats:Record<string,{total:number;aggressive:number;passive:number}>;
  evidences:DnaEvidence[];
  weaknesses:DnaWeakness[];
  strengths:string[];
  checklist:DnaChecklistItem[];
  evolutionScore:number;
  methodology:string[];
};

const allActions:PlayerAction[]=["FOLD","CHECK","CALL","BET","RAISE","ALL-IN"];
const aggressive=new Set<PlayerAction>(["BET","RAISE","ALL-IN"]);
const passive=new Set<PlayerAction>(["FOLD","CHECK","CALL"]);
const pct=(n:number,d:number)=>d?Math.round(n/d*100):0;

export function buildPlayerDevelopmentReport(mode:GameMode,spots:PlayerDnaSpot[],answers:PlayerDnaAnswer[],result:PlayerDnaResult):DnaDevelopmentReport{
  const byId=new Map(spots.map(spot=>[spot.id,spot]));
  const actionStats=Object.fromEntries(allActions.map(action=>[action,0])) as Record<PlayerAction,number>;
  const streetStats:Record<string,{total:number;aggressive:number;passive:number}>={};
  const evidenceMap=new Map<string,{count:number;total:number;spotIds:string[]}>();
  for(const answer of answers){
    actionStats[answer.action]=(actionStats[answer.action]||0)+1;
    const spot=byId.get(answer.spotId);if(!spot)continue;
    streetStats[spot.street]??={total:0,aggressive:0,passive:0};streetStats[spot.street].total++;
    if(aggressive.has(answer.action))streetStats[spot.street].aggressive++;if(passive.has(answer.action))streetStats[spot.street].passive++;
    for(const tag of spot.scenario){const key=tag.toUpperCase();const row=evidenceMap.get(key)??{count:0,total:0,spotIds:[]};row.total++;if(aggressive.has(answer.action))row.count++;row.spotIds.push(spot.id);evidenceMap.set(key,row)}
  }
  const sortedScores=Object.entries(result.scores).sort((a,b)=>b[1]-a[1]);
  const archetype=result.label;
  const secondaryArchetype=`${sortedScores[0][0].toUpperCase()} + ${sortedScores[1][0].toUpperCase()}`;
  const uniqueStreets=Object.keys(streetStats).length;
  const uniqueScenarios=evidenceMap.size;
  const sampleFactor=Math.min(55,answers.length/Math.max(100,answers.length)*55);
  const diversityFactor=Math.min(25,uniqueStreets/4*15+Math.min(10,uniqueScenarios/8));
  const confidence=Math.max(result.confidence,Math.min(97,Math.round(20+sampleFactor+diversityFactor)));
  const confidenceLabel=confidence>=80?"ALTA":confidence>=60?"MÉDIA":"BAIXA";
  const confidenceReason=`${answers.length} decisões válidas, ${uniqueStreets}/4 streets cobertas e ${uniqueScenarios} contextos distintos.`;
  const evidences=[...evidenceMap.entries()].map(([label,row])=>({label,count:row.count,total:row.total,percent:pct(row.count,row.total),spotIds:[...new Set(row.spotIds)].slice(0,8),explanation:`${row.count} de ${row.total} decisões neste contexto foram agressivas.`})).sort((a,b)=>b.total-a.total).slice(0,8);

  const weaknesses:DnaWeakness[]=[];
  if(result.scores.passivity>=50)weaknesses.push({title:"CESSÃO DE INICIATIVA",severity:result.scores.passivity>=65?"ALTA":"MÉDIA",why:"A frequência de linhas passivas está acima do equilíbrio observado no restante do perfil.",trainingTag:"PRESSÃO E INICIATIVA"});
  if(result.scores.aggression>=65&&result.scores.discipline<40)weaknesses.push({title:"AGRESSÃO SEM FILTRO",severity:"ALTA",why:"Agressão elevada aparece sem disciplina proporcional para selecionar os melhores spots.",trainingTag:"SELEÇÃO DE RANGES"});
  if(result.scores.pressure>=65&&result.scores.discipline<45)weaknesses.push({title:"ESCALADA SOB PRESSÃO",severity:"ALTA",why:"O jogador tende a manter ou aumentar a variância quando a disciplina deveria ter maior peso.",trainingTag:"DECISÕES SOB PRESSÃO"});
  const pre=streetStats.PREFLOP;if(pre&&pct(pre.passive,pre.total)>=65)weaknesses.push({title:"PASSIVIDADE PRÉ-FLOP",severity:"MÉDIA",why:`${pct(pre.passive,pre.total)}% das decisões pré-flop foram passivas.`,trainingTag:"PREFLOP AGGRESSION"});
  const river=streetStats.RIVER;if(river&&pct(river.passive,river.total)>=70)weaknesses.push({title:"RIVER CONSERVADOR",severity:"MÉDIA",why:`${pct(river.passive,river.total)}% das decisões de river foram passivas.`,trainingTag:"RIVER VALUE & BLUFF"});
  if(!weaknesses.length)weaknesses.push({title:"SEM LEAK DOMINANTE",severity:"BAIXA",why:"Nenhum padrão isolado atingiu limiar de alerta nesta amostra.",trainingTag:"MIXED REVIEW"});

  const strengths=result.strengths.length?result.strengths:["Perfil ainda em formação; ampliar a amostra aumenta a precisão."];
  const checklist=weaknesses.slice(0,4).map((w,i)=>({id:`${Date.now()}-${i}`,title:`TREINAR ${w.trainingTag}`,reason:w.why,priority:w.severity,status:"PENDENTE" as const,dueAt:null,trainingTag:w.trainingTag}));
  checklist.push({id:`${Date.now()}-review`,title:"REFAZER PLAYER DNA",reason:"Comparar o novo relatório com esta linha de base após concluir os treinos prioritários.",priority:"MÉDIA",status:"PENDENTE",dueAt:null,trainingTag:"PLAYER DNA RETEST"});
  const evolutionScore=Math.round((result.scores.discipline+(100-result.scores.passivity)+Math.min(100,result.scores.aggression)+Math.min(100,result.scores.pressure))/4);
  const methodology=[
    "Cada resposta é ligada ao spot original e aos pesos comportamentais daquela ação.",
    "Os quatro eixos são normalizados pela pontuação máxima possível da amostra.",
    "A classificação combina os eixos dominantes; evidências mostram frequências reais por contexto.",
    "A confiabilidade considera tamanho da amostra, cobertura de streets e diversidade de cenários.",
    "Fraquezas geram tarefas de estudo específicas e uma recomendação de reavaliação posterior."
  ];
  return{archetype,secondaryArchetype,confidence,confidenceLabel,confidenceReason,actionStats,streetStats,evidences,weaknesses,strengths,checklist,evolutionScore,methodology};
}

export function reportToStandaloneHtml(name:string,mode:GameMode,completedAt:number,scores:DnaScores,dev:DnaDevelopmentReport){
  const esc=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]||c));
  const rows=Object.entries(dev.actionStats).filter(([,v])=>v>0).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join("");
  const tasks=dev.checklist.map(t=>`<li><b>${esc(t.priority)}</b> · ${esc(t.title)} — ${esc(t.reason)}</li>`).join("");
  const leaks=dev.weaknesses.map(w=>`<li><b>${esc(w.severity)}</b> · ${esc(w.title)} — ${esc(w.why)}</li>`).join("");
  const evidence=dev.evidences.map(e=>`<li><b>${esc(e.label)}</b>: ${e.count}/${e.total} (${e.percent}%) — ${esc(e.explanation)}</li>`).join("");
  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>${esc(name)}</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 24px;color:#102018}h1,h2{color:#174a31}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bdd6c5;padding:8px;text-align:left}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.card{border:1px solid #bdd6c5;padding:12px}</style><h1>${esc(name)}</h1><p>${esc(mode)} · ${new Date(completedAt).toLocaleString("pt-BR")}</p><h2>PERFIL</h2><p><b>${esc(dev.archetype)}</b> · ${esc(dev.secondaryArchetype)}</p><p>Confiabilidade: <b>${dev.confidence}% · ${dev.confidenceLabel}</b><br>${esc(dev.confidenceReason)}</p><div class="grid"><div class="card">AGRESSÃO<br><b>${scores.aggression}%</b></div><div class="card">DISCIPLINA<br><b>${scores.discipline}%</b></div><div class="card">PRESSÃO<br><b>${scores.pressure}%</b></div><div class="card">PASSIVIDADE<br><b>${scores.passivity}%</b></div></div><h2>AÇÕES</h2><table><tr><th>Ação</th><th>Quantidade</th></tr>${rows}</table><h2>EVIDÊNCIAS</h2><ul>${evidence}</ul><h2>FRAQUEZAS / LEAKS</h2><ul>${leaks}</ul><h2>PLANO DE EVOLUÇÃO</h2><ul>${tasks}</ul><h2>METODOLOGIA</h2><ol>${dev.methodology.map(m=>`<li>${esc(m)}</li>`).join("")}</ol></html>`;
}
