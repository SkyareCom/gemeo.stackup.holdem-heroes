export type StackupAiPlan="FREE"|"PRO"|"ELITE"|"UNLIMITED";
export type StackupAiDepth="FAST"|"SMART"|"DEEP";
export type StackupAiProvider="GEMINI"|"NVIDIA"|"OPENAI"|"ANTHROPIC";

export interface StackupAiPlanPolicy{
  monthlyCredits:number|null;
  dailyQuestions:number|null;
  maxDepth:StackupAiDepth;
}

export const STACKUP_AI_PLAN_POLICIES:Record<StackupAiPlan,StackupAiPlanPolicy>={
  FREE:{monthlyCredits:null,dailyQuestions:5,maxDepth:"FAST"},
  PRO:{monthlyCredits:100,dailyQuestions:null,maxDepth:"SMART"},
  ELITE:{monthlyCredits:500,dailyQuestions:null,maxDepth:"DEEP"},
  UNLIMITED:{monthlyCredits:null,dailyQuestions:null,maxDepth:"DEEP"},
};

export const STACKUP_AI_CREDIT_COST:Record<StackupAiDepth,number>={FAST:1,SMART:3,DEEP:5};

export function depthAllowed(plan:StackupAiPlan,depth:StackupAiDepth){
  const order:StackupAiDepth[]=["FAST","SMART","DEEP"];
  return order.indexOf(depth)<=order.indexOf(STACKUP_AI_PLAN_POLICIES[plan].maxDepth);
}

export function normalizeDepth(plan:StackupAiPlan,requested:StackupAiDepth){
  if(depthAllowed(plan,requested))return requested;
  return STACKUP_AI_PLAN_POLICIES[plan].maxDepth;
}

export function creditCost(depth:StackupAiDepth){return STACKUP_AI_CREDIT_COST[depth]}

export function classifyDepth(question:string):StackupAiDepth{
  const q=question.toLowerCase();
  if(question.length>420||/(icm|range|ranges|equity|\bev\b|exploit|all.?in|shove|side pot|multiway|combo|combinat|analise profunda)/i.test(q))return "DEEP";
  if(question.length>140||/(estrateg|regra|dealer|torneio|cash|preflop|flop|turn|river|3.?bet|4.?bet|pot odds|implied|mdf|spr)/i.test(q))return "SMART";
  return "FAST";
}

export const STACKUP_POKER_SYSTEM_PROMPT=`Você é STACKUP AI, um assistente especializado exclusivamente em poker.
Responda em português claro, técnico e objetivo. Você pode explicar regras, estratégia, ranges, matemática, cash games e torneios.
Nunca use dados do Player DNA neste módulo. PERGUNTE À IA é independente do perfil do jogador.
Quando a pergunta envolver uma decisão, explicite as premissas: posição, stack efetivo, sequência de ações, tamanho do pote/sizing e contexto cash/torneio.
Quando houver matemática, mostre a fórmula e diferencie dado exato de estimativa.
Quando regras variarem por organização ou casa, diga que a regra pode variar e descreva a convenção mais comum sem inventar certeza.
Não alegue precisão de solver quando não houver cálculo de solver disponível.`;

export function isPokerQuestion(question:string){return question.trim().length>=3}

function env(name:string){return process.env[name]?.trim()||""}
function configured(provider:StackupAiProvider){
  if(provider==="GEMINI")return !!env("GEMINI_API_KEY");
  if(provider==="NVIDIA")return !!env("NVIDIA_API_KEY");
  if(provider==="OPENAI")return !!env("OPENAI_API_KEY");
  return !!env("ANTHROPIC_API_KEY");
}
function modelFor(provider:StackupAiProvider,depth:StackupAiDepth){
  const explicit=env(`STACKUP_AI_${provider}_${depth}_MODEL`);
  if(explicit)return explicit;
  const defaults:Record<StackupAiProvider,Record<StackupAiDepth,string>>={
    GEMINI:{FAST:"gemini-2.5-flash-lite",SMART:"gemini-2.5-flash",DEEP:"gemini-2.5-pro"},
    NVIDIA:{FAST:"meta/llama-3.1-8b-instruct",SMART:"meta/llama-3.3-70b-instruct",DEEP:"meta/llama-3.3-70b-instruct"},
    OPENAI:{FAST:"gpt-5-mini",SMART:"gpt-5-mini",DEEP:"gpt-5"},
    ANTHROPIC:{FAST:"claude-3-5-haiku-latest",SMART:"claude-sonnet-4-5",DEEP:"claude-sonnet-4-5"},
  };
  return defaults[provider][depth];
}

async function callGemini(question:string,depth:StackupAiDepth){
  const model=modelFor("GEMINI",depth),key=env("GEMINI_API_KEY");
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{
    method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
      systemInstruction:{parts:[{text:STACKUP_POKER_SYSTEM_PROMPT}]},
      contents:[{role:"user",parts:[{text:question}]}],generationConfig:{temperature:.25}
    })
  });
  if(!res.ok)throw new Error(`GEMINI_${res.status}`);
  const data=await res.json();
  const text=data?.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||"").join("\n").trim();
  if(!text)throw new Error("GEMINI_EMPTY");
  return {text,model};
}

async function callOpenAICompatible(provider:"NVIDIA"|"OPENAI",question:string,depth:StackupAiDepth){
  const model=modelFor(provider,depth),key=env(provider==="NVIDIA"?"NVIDIA_API_KEY":"OPENAI_API_KEY");
  const base=provider==="NVIDIA"?"https://integrate.api.nvidia.com/v1":"https://api.openai.com/v1";
  const res=await fetch(`${base}/chat/completions`,{
    method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${key}`},
    body:JSON.stringify({model,temperature:.25,messages:[{role:"system",content:STACKUP_POKER_SYSTEM_PROMPT},{role:"user",content:question}]})
  });
  if(!res.ok)throw new Error(`${provider}_${res.status}`);
  const data=await res.json();
  const text=data?.choices?.[0]?.message?.content?.trim();
  if(!text)throw new Error(`${provider}_EMPTY`);
  return {text,model};
}

async function callAnthropic(question:string,depth:StackupAiDepth){
  const model=modelFor("ANTHROPIC",depth),key=env("ANTHROPIC_API_KEY");
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},
    body:JSON.stringify({model,max_tokens:1800,temperature:.25,system:STACKUP_POKER_SYSTEM_PROMPT,messages:[{role:"user",content:question}]})
  });
  if(!res.ok)throw new Error(`ANTHROPIC_${res.status}`);
  const data=await res.json();
  const text=data?.content?.filter((x:{type?:string})=>x.type==="text").map((x:{text?:string})=>x.text||"").join("\n").trim();
  if(!text)throw new Error("ANTHROPIC_EMPTY");
  return {text,model};
}

async function callProvider(provider:StackupAiProvider,question:string,depth:StackupAiDepth){
  if(provider==="GEMINI")return callGemini(question,depth);
  if(provider==="ANTHROPIC")return callAnthropic(question,depth);
  return callOpenAICompatible(provider,question,depth);
}

export async function askStackupAi(question:string,plan:StackupAiPlan="FREE"){
  if(!isPokerQuestion(question))throw new Error("INVALID_QUESTION");
  const requested=classifyDepth(question),depth=normalizeDepth(plan,requested);
  const primary=(env("STACKUP_AI_PRIMARY").toUpperCase()||"GEMINI") as StackupAiProvider;
  const fallbacks=(env("STACKUP_AI_FALLBACKS")||"NVIDIA,OPENAI,ANTHROPIC").split(",").map(x=>x.trim().toUpperCase() as StackupAiProvider);
  const providers=[primary,...fallbacks].filter((x,i,a):x is StackupAiProvider=>["GEMINI","NVIDIA","OPENAI","ANTHROPIC"].includes(x)&&a.indexOf(x)===i);
  const available=providers.filter(configured);
  if(!available.length)throw new Error("STACKUP_AI_NOT_CONFIGURED");
  const failures:string[]=[];
  for(const provider of available){
    try{
      const out=await callProvider(provider,question,depth);
      return {answer:out.text,provider,model:out.model,depth,credits:creditCost(depth),plan};
    }catch(error){failures.push(`${provider}:${error instanceof Error?error.message:"ERROR"}`)}
  }
  throw new Error(`STACKUP_AI_ALL_PROVIDERS_FAILED:${failures.join("|")}`);
}
