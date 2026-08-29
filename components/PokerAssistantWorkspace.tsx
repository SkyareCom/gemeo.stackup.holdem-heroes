"use client";

import {useState} from "react";
import styles from "./PokerAssistantWorkspace.module.css";

type Usage={plan:"FREE"|"PRO"|"ELITE"|"UNLIMITED";dayQuestions:number;dailyLimit:number|null;monthCredits:number;monthlyCredits:number|null};
type AiMeta={depth?:"FAST"|"SMART"|"DEEP";credits?:number;plan?:Usage["plan"];usage?:Usage};

export default function PokerAssistantWorkspace(){
  const[question,setQuestion]=useState("");
  const[answer,setAnswer]=useState("");
  const[meta,setMeta]=useState<AiMeta|null>(null);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");

  async function ask(){
    const text=question.trim();if(!text||loading)return;
    setLoading(true);setError("");setAnswer("");
    try{
      const response=await fetch("/api/poker-ai",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question:text})});
      const data=await response.json() as {answer?:string;error?:string;meta?:AiMeta;usage?:Usage};
      if(!response.ok||!data.answer){if(data.usage)setMeta({plan:data.usage.plan,usage:data.usage});throw new Error(data.error||"AI_TEMPORARILY_UNAVAILABLE")}
      setAnswer(data.answer);setMeta(data.meta||null);
    }catch(error){
      const code=error instanceof Error?error.message:"AI_TEMPORARILY_UNAVAILABLE";
      if(code==="DAILY_LIMIT")setError("Limite diário do plano FREE atingido.");
      else if(code==="MONTHLY_CREDITS")setError("Créditos STACKUP AI do plano esgotados neste mês.");
      else if(code==="AI_TEMPORARILY_UNAVAILABLE")setError("STACKUP AI indisponível no momento. Verifique a configuração do provedor de IA no servidor.");
      else setError("Não foi possível processar a pergunta.");
    }finally{setLoading(false)}
  }

  function onKeyDown(event:React.KeyboardEvent<HTMLTextAreaElement>){if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){event.preventDefault();void ask()}}

  const usage=meta?.usage;
  return <div className={styles.shell}>
    <div className="eyebrow">POKER ASSISTANT</div>
    <h2>PERGUNTE À IA</h2>
    <p className={styles.intro}>Perguntas e dúvidas sobre poker. O STACKUP AI seleciona automaticamente a profundidade adequada ao plano e permanece independente do Player DNA.</p>

    {usage&&<div className={styles.usage}><b>STACKUP AI · {usage.plan}</b><span>{usage.dailyLimit!==null?`${usage.dayQuestions}/${usage.dailyLimit} perguntas hoje`:usage.monthlyCredits!==null?`${usage.monthCredits}/${usage.monthlyCredits} créditos no mês`:"USO JUSTO"}</span></div>}

    <div className={styles.composer}>
      <textarea value={question} maxLength={4000} onChange={e=>setQuestion(e.target.value)} onKeyDown={onKeyDown} placeholder="Ex.: O que acontece se o dealer virar uma carta sem querer durante a distribuição?"/>
      <div className={styles.composerFooter}><small>{question.length}/4000 · CTRL/⌘ + ENTER PARA ENVIAR</small><button className="primary" type="button" onClick={()=>void ask()} disabled={loading||question.trim().length<3}>{loading?"ANALISANDO...":"PERGUNTAR"}</button></div>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {answer&&<article className={styles.answer}><span>STACKUP AI</span><div>{answer}</div>{meta&&<small>{meta.depth||"AI"} · {meta.credits??1} CRÉDITO(S) · PLANO {meta.plan||"FREE"}</small>}</article>}

    {!answer&&!error&&<div className={styles.examples}>
      <button type="button" onClick={()=>setQuestion("O que acontece se o dealer virar uma carta sem querer durante a distribuição?")}>REGRAS</button>
      <button type="button" onClick={()=>setQuestion("Como calcular pot odds e quando um call é lucrativo?")}>POT ODDS</button>
      <button type="button" onClick={()=>setQuestion("Como construir um range de 3-bet do BB contra BTN?")}>RANGES</button>
      <button type="button" onClick={()=>setQuestion("Como o ICM muda meus calls de all-in na bolha?")}>ICM</button>
    </div>}
  </div>;
}
