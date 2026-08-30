"use client";

import {useEffect,useMemo,useState} from "react";
import {buildBalancedSpotSession} from "@/lib/player-dna-sampler";
import {buildPlayerDnaExchange} from "@/lib/player-dna-exchange";
import type {DnaDevelopmentReport} from "@/lib/player-dna-report";
import type {PlayerDnaAnswer} from "@/lib/player-dna";
import {playerDnaSpots,type GameMode} from "@/data/player-dna-spots";
import {evolutionSummary,importLegacyHandReviews,readEvolutionLibrary,topLeakTags,upsertEvolutionEnvelope,type StackupEvolutionLibrary} from "@/lib/stackup-evolution-store";

const PLAYER_DNA_KEY="stackup.player-dna.library.v3";

type LegacyDnaReport={id:string;name:string;mode:GameMode;target:number;sessionSeed:number;completedAt:number;answers:PlayerDnaAnswer[];development:DnaDevelopmentReport};

export default function StackupEvolutionWorkspace(){
 const[library,setLibrary]=useState<StackupEvolutionLibrary>({version:1,records:[]});
 const[open,setOpen]=useState(false);
 const summary=useMemo(()=>evolutionSummary(library),[library]);
 const leakTags=useMemo(()=>topLeakTags(summary.activeLeaks),[summary.activeLeaks]);

 useEffect(()=>{
  try{
   importLegacyHandReviews(localStorage);
   const raw=localStorage.getItem(PLAYER_DNA_KEY);
   if(raw){
    const parsed=JSON.parse(raw) as {reports?:LegacyDnaReport[]};
    for(const report of parsed.reports??[]){
     if(!report?.id||!report?.development||!Array.isArray(report.answers))continue;
     const spots=buildBalancedSpotSession(playerDnaSpots,report.mode,report.target,report.sessionSeed);
     const envelope=buildPlayerDnaExchange({reportId:report.id,reportName:report.name,mode:report.mode,completedAt:report.completedAt,answers:report.answers,spots,development:report.development});
     upsertEvolutionEnvelope(envelope,"PLAYER_DNA",report.name,localStorage);
    }
   }
   setLibrary(readEvolutionLibrary(localStorage));
  }catch{}
 },[]);

 function refresh(){try{importLegacyHandReviews(localStorage);setLibrary(readEvolutionLibrary(localStorage))}catch{}}

 return <section style={{marginBottom:16,border:"1px solid rgba(92,187,126,.28)",borderRadius:16,padding:16,background:"rgba(7,20,12,.78)"}}>
  <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",flexWrap:"wrap"}}>
   <div><div className="eyebrow">STACKUP INTELLIGENCE</div><h3 style={{margin:"6px 0"}}>ANÁLISES & EVOLUÇÃO</h3><p style={{margin:0,opacity:.72,fontSize:12}}>PLAYER DNA, análises de mãos, leaks e treinos no mesmo histórico.</p></div>
   <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" onClick={refresh}>ATUALIZAR</button><button type="button" className="primary" onClick={()=>setOpen(v=>!v)}>{open?"FECHAR HISTÓRICO":"ABRIR HISTÓRICO"}</button></div>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginTop:12}}>
   <Info label="ANÁLISES" value={String(summary.records)}/><Info label="PLAYER DNA" value={String(summary.playerDna)}/><Info label="MÃOS" value={String(summary.handReviews)}/><Info label="LEAKS ATIVOS" value={String(summary.activeLeaks.length)}/><Info label="TREINOS PENDENTES" value={String(summary.pendingTraining.length)}/>
  </div>
  {leakTags.length>0&&<div style={{marginTop:10,fontSize:12,opacity:.8}}>FOCOS ATUAIS: {leakTags.map(([tag,count])=>`${tag} (${count})`).join(" · ")}</div>}
  {open&&<div style={{display:"grid",gap:8,marginTop:14}}>{library.records.length===0?<small>NENHUMA EVIDÊNCIA REGISTRADA AINDA.</small>:library.records.map(record=>{
   const spots=record.envelope.spots?.length??0;const leaks=record.envelope.leaks?.filter(l=>l.status!=="RESOLVIDO").length??0;const training=record.envelope.prescriptions?.filter(p=>p.status!=="CONCLUIDO").length??0;
   return <div key={record.id} style={{padding:12,border:"1px solid rgba(92,187,126,.16)",borderRadius:10}}><div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}><strong>{record.title}</strong><span style={{fontSize:11,opacity:.62}}>{record.source}</span></div><small style={{display:"block",marginTop:5,opacity:.7}}>{new Date(record.createdAt).toLocaleString("pt-BR")} · {spots} SPOTS · {leaks} LEAKS · {training} TREINOS</small></div>
  })}</div>}
 </section>
}

function Info({label,value}:{label:string;value:string}){return <div style={{padding:10,border:"1px solid rgba(92,187,126,.14)",borderRadius:9}}><small style={{display:"block",opacity:.55}}>{label}</small><b>{value}</b></div>}
