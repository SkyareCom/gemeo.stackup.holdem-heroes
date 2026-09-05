"use client";

import {useRef,useState} from "react";

export default function HandVisionImport(){
  const[file,setFile]=useState<File|null>(null);
  const[preview,setPreview]=useState("");
  const[context,setContext]=useState("");
  const[result,setResult]=useState("");
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const cameraRef=useRef<HTMLInputElement>(null);
  const fileRef=useRef<HTMLInputElement>(null);

  function choose(next:File|undefined){
    if(!next)return;
    if(!["image/jpeg","image/png","image/webp"].includes(next.type)){setError("Use JPG, PNG ou WEBP.");return}
    if(next.size>8*1024*1024){setError("Máximo de 8 MB por imagem.");return}
    if(preview)URL.revokeObjectURL(preview);
    setFile(next);setPreview(URL.createObjectURL(next));setResult("");setError("");
  }

  async function extract(){
    if(!file||loading)return;
    setLoading(true);setError("");setResult("");
    try{
      const form=new FormData();form.append("image",file);form.append("mode","HAND_REVIEW");form.append("question",context);
      const response=await fetch("/api/poker-vision",{method:"POST",body:form});
      const data=await response.json() as {answer?:string;error?:string};
      if(!response.ok||!data.answer)throw new Error(data.error||"VISION_TEMPORARILY_UNAVAILABLE");
      setResult(data.answer);
    }catch(e){
      const code=e instanceof Error?e.message:"VISION_TEMPORARILY_UNAVAILABLE";
      setError(code==="DAILY_LIMIT"?"Limite diário do plano atingido.":code==="MONTHLY_CREDITS"?"Créditos STACKUP AI esgotados.":"Não foi possível interpretar a imagem agora.");
    }finally{setLoading(false)}
  }

  function clear(){if(preview)URL.revokeObjectURL(preview);setFile(null);setPreview("");setResult("");setError("")}

  return <section style={{marginBottom:18}}>
    <div className="eyebrow">STACKUP AI VISION</div>
    <h3 className="ai-hand-review-feature-title" style={{margin:"8px 0 6px"}}>IMPORTAR MÃO POR FOTO</h3>
    <p className="ai-hand-review-feature-copy" style={{opacity:.72,lineHeight:1.5,marginTop:0}}>Fotografe a mesa ou selecione um print. A IA extrai os dados visíveis para você conferir antes de preencher e analisar a mão.</p>
    <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={e=>choose(e.target.files?.[0])}/>
    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>choose(e.target.files?.[0])}/>
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="primary" type="button" onClick={()=>cameraRef.current?.click()}>📷 CÂMERA</button><button className="primary" type="button" onClick={()=>fileRef.current?.click()}>🖼 ANEXAR IMAGEM</button></div>
    {preview&&<div style={{display:"grid",gridTemplateColumns:"minmax(110px,180px) 1fr",gap:12,alignItems:"center",marginTop:14}}><img src={preview} alt="Mão anexada" style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:12,border:"1px solid rgba(92,187,126,.2)"}}/><div><textarea value={context} onChange={e=>setContext(e.target.value)} placeholder="Opcional: informe algo que não esteja visível na imagem..." style={{width:"100%",minHeight:90}}/><div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}><button className="primary" type="button" onClick={extract} disabled={loading}>{loading?"LENDO IMAGEM...":"EXTRAIR DADOS DA MÃO"}</button><button type="button" onClick={clear}>REMOVER</button></div></div></div>}
    {error&&<div style={{marginTop:12,padding:12,border:"1px solid rgba(92,187,126,.2)",borderRadius:10}}>{error}</div>}
    {result&&<div style={{marginTop:14,padding:15,border:"1px solid rgba(92,187,126,.28)",borderRadius:12,whiteSpace:"pre-wrap",lineHeight:1.6}}><b style={{display:"block",marginBottom:8}}>DADOS EXTRAÍDOS · CONFIRME ANTES DA ANÁLISE</b>{result}</div>}
  </section>;
}
