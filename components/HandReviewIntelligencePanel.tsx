"use client";

import {useMemo,useState} from "react";
import {buildHandReviewExchange} from "@/lib/hand-review-exchange";
import {importLegacyHandReviews,upsertEvolutionEnvelope} from "@/lib/stackup-evolution-store";
import type {HandReviewInput} from "@/lib/hand-review";

const PLAYER_ID_KEY="stackup.player.local-id.v1";

function localPlayerId(){
 if(typeof window==="undefined")return"local-player";
 const saved=localStorage.getItem(PLAYER_ID_KEY);if(saved)return saved;
 const id=`player-${crypto.randomUUID?.()??Date.now()}`;localStorage.setItem(PLAYER_ID_KEY,id);return id;
}

export default function HandReviewIntelligencePanel({input}:{input:HandReviewInput}){
 const[bundle]=useState(()=>buildHandReviewExchange(input,{playerId:localPlayerId()}));
 const[saved,setSaved]=useState(false);
 const leak=bundle.leaks[0];const training=bundle.prescriptions[0];
 const outcome=bundle.spot.decision?.outcome??"NAO_AVALIADA";
 const pulseCount=bundle.pulseCandidates.length;
 const summary=useMemo(()=>outcome==="INCORRETA"?"LEAK DETECTADO":outcome==="CORRETA"?"DECISÃO VALIDADA":"EVIDÊNCIA REGISTRÁVEL",[outcome]);
 function saveEvolution(){
  importLegacyHandReviews(localStorage);
  upsertEvolutionEnvelope(bundle.envelope,"HAND_REVIEW",`MÃO · ${input.game} · ${input.street}${input.heroPosition?` · ${input.heroPosition}`:""}`,localStorage);
  setSaved(true);
 }
 function download(){const blob=new Blob([JSON.stringify(bundle.envelope,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`stackup-hand-review-${bundle.spot.id}.json`;a.click();URL.revokeObjectURL(url)}
 return <section style={{marginTop:18,border:"1px solid rgba(92,187,126,.28)",borderRadius:16,padding:16,background:"rgba(7,20,12,.78)"}}>
  <div className="eyebrow">STACKUP INTELLIGENCE</div><h3 style={{margin:"6px 0"}}>{summary}</h3>
  <p style={{margin:"0 0 12px",opacity:.75,fontSize:12}}>Esta mão alimenta o histórico unificado de evolução, treino e DAILY PULSE sem alterar a matemática da análise.</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8}}>
   <Info label="RESULTADO" value={outcome}/><Info label="LEAKS" value={String(bundle.leaks.length)}/><Info label="TREINOS" value={String(bundle.prescriptions.length)}/><Info label="DAILY PULSE" value={String(pulseCount)}/>
  </div>
  {leak&&<div style={{marginTop:12,padding:12,border:"1px solid rgba(255,170,80,.22)",borderRadius:10}}><small>LEAK DETECTADO · {leak.severity}</small><strong style={{display:"block",marginTop:4}}>{leak.title}</strong><p style={{margin:"5px 0 0",fontSize:12,opacity:.76}}>{leak.description}</p></div>}
  {training&&<div style={{marginTop:8,padding:12,border:"1px solid rgba(92,187,126,.18)",borderRadius:10}}><small>TREINO RECOMENDADO</small><strong style={{display:"block",marginTop:4}}>{training.title} · {training.targetSpots} SPOTS</strong><p style={{margin:"5px 0 0",fontSize:12,opacity:.76}}>{training.timerSeconds?`RELÓGIO ${training.timerSeconds}s · `:""}{training.trainingTags.join(" · ")}</p></div>}
  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}><button type="button" className="primary" onClick={saveEvolution}>{saved?"SALVO EM ANÁLISES & EVOLUÇÃO":"ENVIAR PARA EVOLUÇÃO"}</button><button type="button" onClick={download}>EXPORTAR STACKUP</button></div>
 </section>
}
function Info({label,value}:{label:string;value:string}){return <div style={{padding:10,border:"1px solid rgba(92,187,126,.14)",borderRadius:9}}><small style={{display:"block",opacity:.55}}>{label}</small><b>{value}</b></div>}
