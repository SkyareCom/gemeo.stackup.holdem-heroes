"use client";

import {useMemo,useState} from "react";
import {mathConcepts} from "@/data/math-concepts";
import {mdf,percent,requiredEquity,spr} from "@/lib/poker-math";
import PlayerDnaWorkspace from "@/components/PlayerDnaWorkspace";
import HandReviewWorkspace from "@/components/HandReviewWorkspace";
import HandVisionImport from "@/components/HandVisionImport";
import PokerAssistantWorkspace from "@/components/PokerAssistantWorkspace";

type Module="profile"|"hands"|"ai"|"math";
type MathTab="concepts"|"practice"|"doubts";

const modules:{id:Module;title:string;kicker:string}[]=[
  {id:"profile",title:"DESCOBRIR PERFIL",kicker:"PLAYER DNA"},
  {id:"hands",title:"ANÁLISE DE MÃOS",kicker:"AI HAND REVIEW"},
  {id:"ai",title:"PERGUNTE À IA",kicker:"POKER ASSISTANT"},
  {id:"math",title:"MATEMÁTICA",kicker:"POKER MATH LAB"},
];

function PokerTable(){return <div className="table-wrap"><div className="poker-table"><span className="seat top">VILLAIN · BTN</span><div className="board"><b>A♠</b><b>7♥</b><b>2♣</b><b>J♦</b><i>?</i></div><div className="pot">POT <strong>80</strong></div><span className="seat bottom">HERO · BB · A♦ Q♦</span></div></div>}

export default function Home(){
  const[module,setModule]=useState<Module>("profile");
  const[mathTab,setMathTab]=useState<MathTab>("concepts");
  const[conceptId,setConceptId]=useState("pot-odds");
  const[answer,setAnswer]=useState("");
  const[checked,setChecked]=useState(false);
  const[potValue,setPotValue]=useState("80");
  const[betValue,setBetValue]=useState("40");
  const[stackValue,setStackValue]=useState("600");
  const concept=useMemo(()=>mathConcepts.find(c=>c.id===conceptId)!,[conceptId]);
  const correct=Math.abs(Number(answer)-25)<=0.5;
  const safePot=Math.max(0,Number(potValue)||0),safeBet=Math.max(0,Number(betValue)||0),safeStack=Math.max(0,Number(stackValue)||0);

  function speak(){if(!("speechSynthesis" in window))return;speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(`${concept.title}. ${concept.what} ${concept.purpose} ${concept.formula} ${concept.example}`))}

  return <main>
    <header className="topbar"><div><span className="brand">STACKUP HOLD&apos;EM HEROES</span></div><span className="status">● AI POKER PERFORMANCE SYSTEM</span></header>
    <section className="hero"><p>AI POKER<br/>PERFORMANCE<br/>SYSTEM.</p><h1>UM JOGADOR.<br/><em>QUATRO MÓDULOS.</em><br/>UMA EVOLUÇÃO.</h1></section>
    <nav className="modules">{modules.map(m=><button key={m.id} className={module===m.id?"active":""} onClick={()=>setModule(m.id)}><small>{m.kicker}</small>{m.title}</button>)}</nav>

    {module==="profile"&&<section className="panel profile-panel"><PlayerDnaWorkspace/></section>}

    {module==="hands"&&<section className="panel"><HandVisionImport/><HandReviewWorkspace/></section>}

    {module==="ai"&&<section className="panel"><PokerAssistantWorkspace/></section>}

    {module==="math"&&<section className="math-shell">
      <div className="section-head"><div><div className="eyebrow">POKER MATH LAB</div><h2>MATEMÁTICA DO POKER</h2></div><div className="math-tabs">{(["concepts","practice","doubts"] as MathTab[]).map(t=><button key={t} className={mathTab===t?"active":""} onClick={()=>setMathTab(t)}>{t==="concepts"?"CONCEITOS":t==="practice"?"PRÁTICA":"DÚVIDAS"}</button>)}</div></div>
      {mathTab==="concepts"&&<div className="concept-layout"><aside>{mathConcepts.map(c=><button key={c.id} className={conceptId===c.id?"active":""} onClick={()=>setConceptId(c.id)}>{c.title}</button>)}</aside><article className="explanation"><span className="tag">CONCEITO</span><h3>{concept.title}</h3><Info title="O QUE É" text={concept.what}/><Info title="PARA QUE SERVE" text={concept.purpose}/><Info title="COMO CALCULAR" text={concept.formula}/><Info title="QUANDO USAR" text={concept.when}/><Info title="EXEMPLO" text={concept.example}/><Info title="NA MESA" text={concept.table}/><button className="voice" onClick={speak}>▶ OUVIR EXPLICAÇÃO</button></article></div>}
      {mathTab==="practice"&&<div className="practice"><div><span className="tag">INTERMEDIÁRIO · POT ODDS</span><h3>VOCÊ TEM O PREÇO CERTO?</h3><PokerTable/><div className="scenario"><span>POTE NO TURN <b>80</b></span><span>VILLAIN BET <b>40</b></span><span>CALL <b>40</b></span></div></div><div className="question"><p>Qual é a equity mínima necessária para o call?</p><div className="answer"><input inputMode="decimal" value={answer} onChange={e=>{setAnswer(e.target.value);setChecked(false)}} placeholder="0"/><b>%</b></div><button className="primary" onClick={()=>setChecked(true)}>VERIFICAR</button>{checked&&<div className={correct?"feedback ok":"feedback bad"}><strong>{correct?"CORRETO · 25%":"REVISE O CÁLCULO"}</strong><p>Call ÷ pote final = 40 ÷ (80 + 40 + 40) = 25%.</p><small>NA MESA: se sua equity contra o range for maior que 25%, o call supera o breakeven considerando apenas o preço atual.</small></div>}</div></div>}
      {mathTab==="doubts"&&<div className="doubts"><div className="doubt-card"><span className="tag">DÚVIDA LIVRE</span><h3>PERGUNTE SOBRE MATEMÁTICA</h3><textarea placeholder="Ex.: Qual a diferença entre pot odds e implied odds?"/><button className="primary">EXPLICAR</button></div><div className="doubt-card"><span className="tag">DÚVIDA SOBRE UMA MÃO</span><h3>CALCULADORA DE SPOT</h3><div className="calc-grid"><label>Pote<input value={potValue} onChange={e=>setPotValue(e.target.value)} inputMode="decimal"/></label><label>Aposta<input value={betValue} onChange={e=>setBetValue(e.target.value)} inputMode="decimal"/></label><label>Stack efetivo<input value={stackValue} onChange={e=>setStackValue(e.target.value)} inputMode="decimal"/></label></div><div className="metrics"><Metric label="EQUITY MÍNIMA" value={percent(requiredEquity(safePot,safeBet))}/><Metric label="SPR" value={spr(safeStack,safePot||1).toFixed(1)}/><Metric label="MDF" value={percent(mdf(safePot,safeBet))}/></div><small className="exact">● DADOS EXATOS — recalculados em tempo real a partir dos valores informados.</small></div></div>}
    </section>}
  </main>;
}

function Info({title,text}:{title:string;text:string}){return <div className="info"><b>{title}</b><p>{text}</p></div>}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><small>{label}</small><strong>{value}</strong></div>}
