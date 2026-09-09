"use client";

import {useRef,useState} from "react";
import styles from "./PokerAssistantWorkspace.module.css";

type Usage={plan:"FREE"|"PRO"|"ELITE"|"UNLIMITED";dayQuestions:number;dailyLimit:number|null;monthCredits:number;monthlyCredits:number|null};
type AiMeta={depth?:"FAST"|"SMART"|"DEEP";credits?:number;plan?:Usage["plan"];usage?:Usage};

function localPokerAnswer(question:string){
  const q=question.toUpperCase();
  if(q.includes("POT ODDS"))return "MODO LOCAL: POT ODDS = VALOR DO CALL / (POTE APÓS O CALL). COMPARE ESSA PORCENTAGEM COM SUA EQUITY ESTIMADA. SE A EQUITY FOR MAIOR QUE A EQUITY MÍNIMA EXIGIDA, O CALL TENDE A SER LUCRATIVO EM CHIP EV.";
  if(q.includes("ICM"))return "MODO LOCAL: ICM AUMENTA O CUSTO DE SER ELIMINADO EM FASES DE PREMIAÇÃO. NA BOLHA E EM MESA FINAL, CALLS DE ALL-IN COSTUMAM EXIGIR MAIS EQUITY DO QUE EM CHIP EV PURO. STACKS, PAYOUTS E COBERTURA DOS ADVERSÁRIOS MUDAM A DECISÃO.";
  if(q.includes("3-BET")||q.includes("RANGE"))return "MODO LOCAL: UM RANGE DE 3-BET DEVE CONSIDERAR POSIÇÃO, STACK EFETIVO, TAMANHO DA ABERTURA E TENDÊNCIAS DO ADVERSÁRIO. CONTRA BTN, O BB PODE DEFENDER MAIS COM CALL E 3-BET DO QUE CONTRA POSIÇÕES INICIAIS. SEPARE VALUE, BLUFFS E MÃOS QUE REALIZAM BEM SUA EQUITY.";
  if(q.includes("DEALER")||q.includes("CARTA"))return "MODO LOCAL: REGRAS EXATAS DEPENDEM DO REGULAMENTO DA CASA E DO TORNEIO. EM CASO DE CARTA EXPOSTA OU ERRO DE DISTRIBUIÇÃO, O PROCEDIMENTO PADRÃO É PARAR A AÇÃO E CHAMAR O FLOOR/DEALER RESPONSÁVEL ANTES DE CONTINUAR.";
  return "MODO LOCAL DO PREVIEW: A INTERFACE ESTÁ FUNCIONANDO, MAS O GITHUB PAGES NÃO EXECUTA O BACKEND DA STACKUP AI. PARA UMA RESPOSTA COMPLETA COM IA, ESTE MESMO FRONTEND PRECISA ESTAR CONECTADO AO SERVIDOR DA API.";
}

export default function PokerAssistantWorkspace(){
  const[question,setQuestion]=useState("");
  const[answer,setAnswer]=useState("");
  const[meta,setMeta]=useState<AiMeta|null>(null);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const[image,setImage]=useState<File|null>(null);
  const[preview,setPreview]=useState("");
  const cameraRef=useRef<HTMLInputElement>(null);
  const fileRef=useRef<HTMLInputElement>(null);

  function chooseImage(file:File|undefined){
    if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setError("USE UMA IMAGEM JPG, PNG OU WEBP.");return}
    if(file.size>8*1024*1024){setError("A IMAGEM DEVE TER NO MÁXIMO 8 MB.");return}
    setImage(file);setError("");setAnswer("");
    if(preview)URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  function clearImage(){if(preview)URL.revokeObjectURL(preview);setImage(null);setPreview("")}

  async function ask(){
    const text=question.trim();if((!text&&!image)||loading)return;
    setLoading(true);setError("");setAnswer("");
    try{
      let response:Response;
      if(image){
        const form=new FormData();form.append("image",image);form.append("mode","QUESTION");form.append("question",text);
        response=await fetch("/api/poker-vision",{method:"POST",body:form});
      }else{
        response=await fetch("/api/poker-ai",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question:text})});
      }
      const data=await response.json() as {answer?:string;error?:string;meta?:AiMeta;usage?:Usage};
      if(!response.ok||!data.answer){if(data.usage)setMeta({plan:data.usage.plan,usage:data.usage});throw new Error(data.error||"AI_TEMPORARILY_UNAVAILABLE")}
      setAnswer(data.answer.toLocaleUpperCase("pt-BR"));setMeta(data.meta||null);
    }catch(error){
      const code=error instanceof Error?error.message:"AI_TEMPORARILY_UNAVAILABLE";
      if(code==="DAILY_LIMIT")setError("LIMITE DIÁRIO DO PLANO FREE ATINGIDO.");
      else if(code==="MONTHLY_CREDITS")setError("CRÉDITOS STACKUP AI DO PLANO ESGOTADOS NESTE MÊS.");
      else if(code==="IMAGE_TOO_LARGE")setError("A IMAGEM DEVE TER NO MÁXIMO 8 MB.");
      else if(code==="UNSUPPORTED_IMAGE")setError("FORMATO DE IMAGEM NÃO SUPORTADO.");
      else if(image)setError("A IMAGEM FOI ANEXADA, MAS O PREVIEW ESTÁTICO NÃO TEM O BACKEND DE VISÃO ATIVO.");
      else{setAnswer(localPokerAnswer(text));setMeta(null)}
    }finally{setLoading(false)}
  }

  function onKeyDown(event:React.KeyboardEvent<HTMLTextAreaElement>){if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){event.preventDefault();void ask()}}

  const usage=meta?.usage;
  return <div className={styles.shell}>
    <div className="eyebrow">POKER ASSISTANT</div>
    <h2>PERGUNTE À IA</h2>
    <p className={styles.intro}>PERGUNTAS E DÚVIDAS SOBRE POKER. VOCÊ TAMBÉM PODE FOTOGRAFAR OU ANEXAR UMA IMAGEM PARA A STACKUP AI INTERPRETAR VISUALMENTE.</p>

    {usage&&<div className={styles.usage}><b>STACKUP AI · {usage.plan}</b><span>{usage.dailyLimit!==null?`${usage.dayQuestions}/${usage.dailyLimit} PERGUNTAS HOJE`:usage.monthlyCredits!==null?`${usage.monthCredits}/${usage.monthlyCredits} CRÉDITOS NO MÊS`:"USO JUSTO"}</span></div>}

    <div className={styles.mediaActions}>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={e=>chooseImage(e.target.files?.[0])}/>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>chooseImage(e.target.files?.[0])}/>
      <button type="button" onClick={()=>cameraRef.current?.click()}>📷 CÂMERA</button>
      <button type="button" onClick={()=>fileRef.current?.click()}>🖼 ANEXAR IMAGEM</button>
    </div>

    {preview&&<div className={styles.preview}><img src={preview} alt="IMAGEM ANEXADA PARA ANÁLISE"/><div><b>IMAGEM PRONTA</b><span>{image?.name}</span><button type="button" onClick={clearImage}>REMOVER</button></div></div>}

    <div className={styles.composer}>
      <textarea value={question} maxLength={4000} onChange={e=>setQuestion(e.target.value)} onKeyDown={onKeyDown} placeholder={image?"PERGUNTE ALGO SOBRE A IMAGEM OU APENAS ENVIE PARA INTERPRETAÇÃO...":"EX.: O QUE ACONTECE SE O DEALER VIRAR UMA CARTA SEM QUERER DURANTE A DISTRIBUIÇÃO?"}/>
      <div className={styles.composerFooter}><small>{question.length}/4000 · IMAGEM OPCIONAL</small><button className="primary" type="button" onClick={()=>void ask()} disabled={loading||(!image&&question.trim().length<3)}>{loading?"ANALISANDO...":"PERGUNTAR"}</button></div>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {answer&&<article className={styles.answer}><span>STACKUP AI</span><div>{answer}</div>{meta&&<small>{meta.depth||"AI"} · {meta.credits??1} CRÉDITO(S) · PLANO {meta.plan||"FREE"}</small>}</article>}

    {!answer&&!error&&<div className={styles.examples}>
      <button type="button" onClick={()=>setQuestion("O QUE ACONTECE SE O DEALER VIRAR UMA CARTA SEM QUERER DURANTE A DISTRIBUIÇÃO?")}>REGRAS</button>
      <button type="button" onClick={()=>setQuestion("COMO CALCULAR POT ODDS E QUANDO UM CALL É LUCRATIVO?")}>POT ODDS</button>
      <button type="button" onClick={()=>setQuestion("COMO CONSTRUIR UM RANGE DE 3-BET DO BB CONTRA BTN?")}>RANGES</button>
      <button type="button" onClick={()=>setQuestion("COMO O ICM MUDA MEUS CALLS DE ALL-IN NA BOLHA?")}>ICM</button>
    </div>}
  </div>;
}
