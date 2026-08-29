"use client";

import {useState} from "react";
import PlayerDnaWorkspace from "@/components/PlayerDnaWorkspaceV2";
import HandReviewWorkspace from "@/components/HandReviewWorkspace";
import HandVisionImport from "@/components/HandVisionImport";
import PokerAssistantWorkspace from "@/components/PokerAssistantWorkspace";
import MathLabWorkspace from "@/components/MathLabWorkspace";

type Module="profile"|"hands"|"ai"|"math";

const modules:{id:Module;title:string;kicker:string}[]=[
  {id:"profile",title:"DESCOBRIR PERFIL",kicker:"PLAYER DNA"},
  {id:"hands",title:"ANÁLISE DE MÃOS",kicker:"AI HAND REVIEW"},
  {id:"ai",title:"PERGUNTE À IA",kicker:"POKER ASSISTANT"},
  {id:"math",title:"MATEMÁTICA",kicker:"POKER MATH LAB"},
];

export default function Home(){
  const[module,setModule]=useState<Module>("profile");
  return <main>
    <header className="topbar"><div><span className="brand">STACKUP HOLD&apos;EM HEROES</span></div><span className="status">● AI POKER PERFORMANCE SYSTEM</span></header>
    <section className="hero"><p>AI POKER<br/>PERFORMANCE<br/>SYSTEM.</p><h1>UM JOGADOR.<br/><em>QUATRO MÓDULOS.</em><br/>UMA EVOLUÇÃO.</h1></section>
    <nav className="modules">{modules.map(item=><button key={item.id} className={module===item.id?"active":""} onClick={()=>setModule(item.id)}><small>{item.kicker}</small>{item.title}</button>)}</nav>
    {module==="profile"&&<section className="panel profile-panel"><PlayerDnaWorkspace/></section>}
    {module==="hands"&&<section className="panel"><HandVisionImport/><HandReviewWorkspace/></section>}
    {module==="ai"&&<section className="panel"><PokerAssistantWorkspace/></section>}
    {module==="math"&&<section className="panel"><MathLabWorkspace/></section>}
  </main>;
}
