import "server-only";
import {STACKUP_POKER_SYSTEM_PROMPT,type StackupAiProvider} from "@/lib/stackup-ai";

export type VisionMode="QUESTION"|"HAND_REVIEW";

export interface VisionResult{
  text:string;
  provider:StackupAiProvider;
  model:string;
}

function providerOrder():StackupAiProvider[]{
  const raw=process.env.STACKUP_AI_VISION_PROVIDER_ORDER||process.env.STACKUP_AI_PROVIDER_ORDER||"GEMINI,OPENAI,ANTHROPIC,NVIDIA";
  const valid=new Set(["GEMINI","NVIDIA","OPENAI","ANTHROPIC"]);
  return raw.split(",").map(v=>v.trim().toUpperCase()).filter(v=>valid.has(v)) as StackupAiProvider[];
}

function keyFor(provider:StackupAiProvider){
  return ({GEMINI:process.env.GEMINI_API_KEY,NVIDIA:process.env.NVIDIA_API_KEY,OPENAI:process.env.OPENAI_API_KEY,ANTHROPIC:process.env.ANTHROPIC_API_KEY} as const)[provider];
}

function modelFor(provider:StackupAiProvider){
  const configured=process.env[`${provider}_VISION_MODEL`];
  if(configured)return configured;
  return ({
    GEMINI:"gemini-2.0-flash",
    OPENAI:"gpt-4.1-mini",
    ANTHROPIC:"claude-3-5-sonnet-latest",
    NVIDIA:"meta/llama-3.2-90b-vision-instruct",
  } as const)[provider];
}

function promptFor(mode:VisionMode,question:string){
  if(mode==="HAND_REVIEW")return `${STACKUP_POKER_SYSTEM_PROMPT}\n\nVocê recebeu uma foto/print para reconstrução de uma mão de poker. Extraia somente o que estiver visível. Nunca invente valores. Responda em português com estes campos, marcando NÃO IDENTIFICADO quando faltar: MODALIDADE; BLINDS/ANTE; STREET; HERO POSIÇÃO; HERO CARTAS; HERO STACK; VILÕES/POSIÇÕES; STACKS; BOARD; POTE; AÇÕES EM ORDEM COM SIZINGS; OBSERVAÇÕES. Ao final inclua CONFIANÇA: ALTA/MÉDIA/BAIXA e liste DADOS QUE PRECISAM DE CONFIRMAÇÃO. Não dê veredito estratégico ainda; a mão deve ser confirmada antes da análise.${question?`\n\nContexto do usuário: ${question}`:""}`;
  return `${STACKUP_POKER_SYSTEM_PROMPT}\n\nAnalise a imagem anexada e responda à dúvida do usuário usando somente o que puder identificar com segurança. Se algum detalhe visual for ambíguo, diga explicitamente.${question?`\n\nPergunta: ${question}`:""}`;
}

async function jsonOrThrow(response:Response){
  const json=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(`provider_http_${response.status}`);
  return json;
}

async function callGemini(base64:string,mime:string,prompt:string):Promise<VisionResult>{
  const provider:StackupAiProvider="GEMINI",key=keyFor(provider);if(!key)throw new Error("provider_not_configured");
  const model=modelFor(provider);
  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt},{inlineData:{mimeType:mime,data:base64}}]}],generationConfig:{temperature:.15,maxOutputTokens:1800}}),signal:AbortSignal.timeout(30000)});
  const json=await jsonOrThrow(response) as {candidates?:Array<{content?:{parts?:Array<{text?:string}>}}>};
  const text=json.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim();if(!text)throw new Error("empty_provider_response");
  return{text,provider,model};
}

async function callOpenAiCompatible(provider:"OPENAI"|"NVIDIA",base64:string,mime:string,prompt:string):Promise<VisionResult>{
  const key=keyFor(provider);if(!key)throw new Error("provider_not_configured");const model=modelFor(provider);
  const endpoint=provider==="NVIDIA"?"https://integrate.api.nvidia.com/v1/chat/completions":"https://api.openai.com/v1/chat/completions";
  const response=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${key}`},body:JSON.stringify({model,messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:`data:${mime};base64,${base64}`}}]}],temperature:.15,max_tokens:1800}),signal:AbortSignal.timeout(30000)});
  const json=await jsonOrThrow(response) as {choices?:Array<{message?:{content?:string}}>};const text=json.choices?.[0]?.message?.content?.trim();if(!text)throw new Error("empty_provider_response");return{text,provider,model};
}

async function callAnthropic(base64:string,mime:string,prompt:string):Promise<VisionResult>{
  const provider:StackupAiProvider="ANTHROPIC",key=keyFor(provider);if(!key)throw new Error("provider_not_configured");const model=modelFor(provider);
  const response=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},body:JSON.stringify({model,max_tokens:1800,temperature:.15,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mime,data:base64}},{type:"text",text:prompt}]}]}),signal:AbortSignal.timeout(30000)});
  const json=await jsonOrThrow(response) as {content?:Array<{type?:string;text?:string}>};const text=json.content?.filter(c=>c.type==="text").map(c=>c.text||"").join("").trim();if(!text)throw new Error("empty_provider_response");return{text,provider,model};
}

export async function completePokerVision(base64:string,mime:string,mode:VisionMode,question:string):Promise<VisionResult>{
  const prompt=promptFor(mode,question),errors:string[]=[];
  for(const provider of providerOrder()){
    try{
      if(provider==="GEMINI")return await callGemini(base64,mime,prompt);
      if(provider==="OPENAI"||provider==="NVIDIA")return await callOpenAiCompatible(provider,base64,mime,prompt);
      return await callAnthropic(base64,mime,prompt);
    }catch(error){errors.push(`${provider}:${error instanceof Error?error.message:"unknown"}`)}
  }
  throw new Error(`no_vision_provider_available:${errors.join("|")}`);
}
