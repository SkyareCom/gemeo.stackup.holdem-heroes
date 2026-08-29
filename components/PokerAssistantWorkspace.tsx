"use client";

import {useState} from "react";
import styles from "./PokerAssistantWorkspace.module.css";

type Depth="FAST"|"SMART"|"DEEP";

export default function PokerAssistantWorkspace(){
  const[question,setQuestion]=useState("");
  const[answer,setAnswer]=useState("");
  const[depth,setDepth]=useState<Depth>("FAST");
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");

  async function ask(){
    const text=question.trim();if(!text||loading)return;
    setLoading(true);setError("");setAnswer("");
    try{
      const response=await fetch("/api/poker-ai",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question:text,depth})});
      const data=await response.json() as {answer?:string;error?:string;depth?:Depth;credits?:number};
      if(!response.ok||!data.answer)throw new Error(data.error||"AI_TEMPORARILY_UNAVAILABLE");
      setAnswer(data.answer);if(data.depth)setDepth(data.depth);
    }catch(error){
      const code=error instanceof Error?error.message:"AI_TEMPORARILY_UNAVAILABLE";
      setError(code==="AI_TEMPORARILY_UNAVAILABLE"?"STACKUP AI indisponível no momento. Verifique a configuração do provedor de IA no servidor.":"Não foi possível processar a pergunta.");
    }finally{setLoading(false)}
  }

  function onKeyDown(event:React.KeyboardEvent<HTMLTextAreaElement>){
    if((event.ctrlKey||event.metaKey)&&event.key==="Enter"){event.preventDefault();void ask()}
  }

  return <div className={styles.shell}>
    <div className="eyebrow">POKER ASSISTANT</div>
    <h2>PERGUNTE À IA</h2>
    <p className={styles.intro}>Perguntas e dúvidas sobre poker. Este módulo funciona de forma independente do Player DNA.</p>

    <div className={styles.depths} aria-label="Profundidade da resposta">
      {(["FAST","SMART","DEEP"] as Depth[]).map(item=><button key={item} type="button" className={depth===item?styles.activeDepth:""} onClick={()=>setDepth(item)} disabled={loading}>{item}</button>)}
    </div>

    <div className={styles.composer}>
      <textarea value={question} maxLength={2500} onChange={e=>setQuestion(e.target.value)} onKeyDown={onKeyDown} placeholder="Ex.: Como jogar pares baixos no pré-flop contra um open de posição inicial?"/>
      <div className={styles.composerFooter}><small>{question.length}/2500 · CTRL/⌘ + ENTER PARA ENVIAR</small><button className="primary" type="button" onClick={()=>void ask()} disabled={loading||question.trim().length<3}>{loading?"ANALISANDO...":"PERGUNTAR"}</button></div>
    </div>

    {error&&<div className={styles.error}>{error}</div>}
    {answer&&<article className={styles.answer}><span>STACKUP AI</span><div>{answer}</div></article>}

    {!answer&&!error&&<div className={styles.examples}>
      <button type="button" onClick={()=>setQuestion("Como calcular pot odds e quando um call é lucrativo?")}>POT ODDS</button>
      <button type="button" onClick={()=>setQuestion("Como construir um range de 3-bet do BB contra BTN?")}>RANGES</button>
      <button type="button" onClick={()=>setQuestion("Como o ICM muda meus calls de all-in na bolha?")}>ICM</button>
      <button type="button" onClick={()=>setQuestion("Quais são as regras mais comuns para showdown e muck?")}>REGRAS</button>
    </div>}
  </div>;
}
