"use client";

import {useState} from "react";

type AiMeta={depth?:string;credits?:number;plan?:string};

export default function PokerAiWorkspace(){
  const[question,setQuestion]=useState("");
  const[answer,setAnswer]=useState("");
  const[meta,setMeta]=useState<AiMeta|null>(null);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");

  async function ask(){
    const q=question.trim();
    if(q.length<3){setError("DIGITE UMA PERGUNTA SOBRE POKER.");setAnswer("");return}
    setLoading(true);setError("");setAnswer("");setMeta(null);
    try{
      const res=await fetch("/api/poker-ai",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question:q})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data?.error||"AI_TEMPORARILY_UNAVAILABLE");
      setAnswer(data.answer||"");setMeta(data.meta||null);
    }catch(err){
      const code=err instanceof Error?err.message:"AI_TEMPORARILY_UNAVAILABLE";
      setError(code==="AI_TEMPORARILY_UNAVAILABLE"?"STACKUP AI INDISPONÍVEL AGORA. VERIFIQUE O PROVEDOR CONFIGURADO NO SERVIDOR.":code);
    }finally{setLoading(false)}
  }

  return <>
    <div className="eyebrow">POKER ASSISTANT</div>
    <h2>PERGUNTE À IA</h2>
    <p>Regras, estratégia, dealer, ranges, matemática, cash games e torneios. Este módulo é independente do Player DNA.</p>
    <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="O que você quer entender?" onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter")ask()}}/>
    <button className="primary" onClick={ask} disabled={loading}>{loading?"ANALISANDO...":"PERGUNTAR"}</button>
    {error&&<div className="feedback bad"><strong>ERRO</strong><p>{error}</p></div>}
    {answer&&<div className="explanation" style={{marginTop:18}}><span className="tag">STACKUP AI</span><div style={{whiteSpace:"pre-wrap",lineHeight:1.65,marginTop:12}}>{answer}</div>{meta&&<small className="exact" style={{display:"block",marginTop:14}}>● {meta.depth||"AI"} · {meta.credits??1} CRÉDITO(S) STACKUP AI · PLANO {meta.plan||"FREE"}</small>}</div>}
  </>;
}
