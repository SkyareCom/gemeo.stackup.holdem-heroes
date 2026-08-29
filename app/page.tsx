"use client";

import { useMemo, useState } from "react";
import { mathConcepts } from "@/data/math-concepts";
import { playerDnaSpots, type PlayerAction, type PlayerDnaSpot } from "@/data/player-dna-spots";
import { evaluatePlayerDna, type PlayerDnaAnswer } from "@/lib/player-dna";
import { mdf, percent, requiredEquity, spr } from "@/lib/poker-math";

type Module = "profile" | "hands" | "ai" | "math";
type MathTab = "concepts" | "practice" | "doubts";

const modules: { id: Module; title: string; kicker: string }[] = [
  { id: "profile", title: "DESCOBRIR PERFIL", kicker: "PLAYER DNA" },
  { id: "hands", title: "ANÁLISE DE MÃOS", kicker: "AI HAND REVIEW" },
  { id: "ai", title: "PERGUNTE À IA", kicker: "POKER ASSISTANT" },
  { id: "math", title: "MATEMÁTICA", kicker: "POKER MATH LAB" },
];

function SpotStructure({ spot }: { spot: PlayerDnaSpot }) {
  return (
    <div className="spot-structure">
      <section className="spot-block villains-block">
        <h4>VILÃO OU VILÕES</h4>
        {spot.villains.map((villain, index) => (
          <div className="spot-row" key={`${villain.position}-${index}`}>
            <span>POSIÇÃO<strong>{villain.position}</strong></span>
            <span>STACK<strong>{villain.stack} BB</strong></span>
            <span>AÇÃO<strong>{villain.action}</strong></span>
            <span>VALOR<strong>{villain.value}</strong></span>
          </div>
        ))}
      </section>
      <section className="spot-block">
        <h4>POT</h4>
        <div className="pot-grid">
          <div className="data-box"><small>MAIN</small><b>{spot.pot.main} BB</b></div>
          <div className="data-box"><small>SIDE</small><b>{spot.pot.side ? `${spot.pot.side} BB` : "—"}</b></div>
        </div>
        {spot.board && <div className="board-line"><small>BOARD</small><b>{spot.board}</b></div>}
      </section>
      <section className="spot-block">
        <h4>HERÓI</h4>
        <div className="hero-grid">
          <div className="data-box"><small>POSIÇÃO</small><b>{spot.hero.position}</b></div>
          <div className="data-box"><small>CARTAS</small><b>{spot.hero.cards}</b></div>
          <div className="data-box"><small>STACK</small><b>{spot.hero.stack} BB</b></div>
          <div className="data-box"><small>STREET</small><b>{spot.street}</b></div>
        </div>
      </section>
    </div>
  );
}

function PokerTable() {
  return (
    <div className="table-wrap">
      <div className="poker-table">
        <span className="seat top">VILLAIN · BTN</span>
        <div className="board"><b>A♠</b><b>7♥</b><b>2♣</b><b>J♦</b><i>?</i></div>
        <div className="pot">POT <strong>80</strong></div>
        <span className="seat bottom">HERO · BB · A♦ Q♦</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [module, setModule] = useState<Module>("profile");
  const [mathTab, setMathTab] = useState<MathTab>("concepts");
  const [conceptId, setConceptId] = useState("pot-odds");
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [question, setQuestion] = useState("");
  const [dnaTarget, setDnaTarget] = useState(100);
  const [dnaIndex, setDnaIndex] = useState(0);
  const [dnaAnswers, setDnaAnswers] = useState<PlayerDnaAnswer[]>([]);
  const [dnaStarted, setDnaStarted] = useState(false);
  const [dnaFinished, setDnaFinished] = useState(false);
  const [potValue, setPotValue] = useState("80");
  const [betValue, setBetValue] = useState("40");
  const [stackValue, setStackValue] = useState("600");

  const concept = useMemo(() => mathConcepts.find((c) => c.id === conceptId)!, [conceptId]);
  const correct = Math.abs(Number(answer) - 25) <= 0.5;
  const dnaSpot = playerDnaSpots[dnaIndex % playerDnaSpots.length];
  const dnaResult = useMemo(() => evaluatePlayerDna(playerDnaSpots, dnaAnswers), [dnaAnswers]);
  const safePot = Math.max(0, Number(potValue) || 0);
  const safeBet = Math.max(0, Number(betValue) || 0);
  const safeStack = Math.max(0, Number(stackValue) || 0);

  function speak() {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance(`${concept.title}. ${concept.what} ${concept.purpose} ${concept.formula} ${concept.example}`));
  }

  function startDna(target: number) {
    setDnaTarget(target);
    setDnaIndex(0);
    setDnaAnswers([]);
    setDnaFinished(false);
    setDnaStarted(true);
  }

  function answerDna(action: PlayerAction) {
    const next = [...dnaAnswers, { spotId: dnaSpot.id, action }];
    setDnaAnswers(next);
    const practicalTarget = Math.min(dnaTarget, playerDnaSpots.length);
    if (next.length >= practicalTarget) {
      setDnaFinished(true);
      return;
    }
    setDnaIndex((value) => value + 1);
  }

  return (
    <main>
      <header className="topbar">
        <div><span className="brand">STACKUP HOLD&apos;EM HEROES</span></div>
        <span className="status">● AI POKER PERFORMANCE SYSTEM</span>
      </header>

      <section className="hero">
        <p>AI POKER<br/>PERFORMANCE<br/>SYSTEM.</p>
        <h1>UM JOGADOR.<br/><em>QUATRO MÓDULOS.</em><br/>UMA EVOLUÇÃO.</h1>
      </section>

      <nav className="modules">
        {modules.map((m) => <button key={m.id} className={module === m.id ? "active" : ""} onClick={() => setModule(m.id)}><small>{m.kicker}</small>{m.title}</button>)}
      </nav>

      {module === "profile" && <section className="panel profile-panel">
        <div className="eyebrow">PLAYER DNA</div><h2>DESCUBRA SEU PERFIL</h2>
        {!dnaStarted && <>
          <p>O Player DNA mede tendências de agressão, disciplina, resposta à pressão e passividade usando decisões em spots variados. Quanto maior a amostra, maior a estabilidade do diagnóstico.</p>
          <div className="spot-grid">{[100,300,500,1000,3000].map(n=><button key={n} onClick={()=>startDna(n)}><strong>{n}</strong><span>SPOTS</span></button>)}</div>
          <div className="coming">VERSÃO DE TESTE · O motor usa 12 spots-base rotativos nesta etapa. A arquitetura já aceita expansão para milhares de spots sem duplicar a interface.</div>
        </>}

        {dnaStarted && !dnaFinished && <div className="dna-session">
          <div className="dna-progress"><span>AMOSTRA {dnaTarget} SPOTS</span><strong>{dnaAnswers.length + 1} / {Math.min(dnaTarget, playerDnaSpots.length)}</strong></div>
          <div className="progress-track"><i style={{width:`${((dnaAnswers.length + 1) / Math.min(dnaTarget, playerDnaSpots.length)) * 100}%`}}/></div>
          <SpotStructure spot={dnaSpot}/>
          <div className="dna-question"><span className="tag">DECISÃO</span><h3>{dnaSpot.prompt}</h3><div className="action-grid">{(["FOLD","CALL","RAISE"] as PlayerAction[]).map(action=><button key={action} onClick={()=>answerDna(action)}>{action}</button>)}</div></div>
        </div>}

        {dnaFinished && <div className="dna-result">
          <div className="result-head"><div><span className="tag">PLAYER DNA · AMOSTRA INICIAL</span><h3>{dnaResult.label}</h3></div><div className="confidence"><small>CONFIANÇA</small><strong>{dnaResult.confidence}%</strong></div></div>
          <div className="dna-metrics">
            <Metric label="AGRESSÃO" value={`${dnaResult.scores.aggression}%`}/>
            <Metric label="DISCIPLINA" value={`${dnaResult.scores.discipline}%`}/>
            <Metric label="PRESSÃO" value={`${dnaResult.scores.pressure}%`}/>
            <Metric label="PASSIVIDADE" value={`${dnaResult.scores.passivity}%`}/>
          </div>
          <div className="dna-insights"><div><b>PONTOS FORTES</b>{dnaResult.strengths.map(item=><p key={item}>● {item}</p>)}</div><div><b>PONTOS DE ATENÇÃO</b>{dnaResult.watchouts.map(item=><p key={item}>● {item}</p>)}</div></div>
          <button className="primary" onClick={()=>setDnaStarted(false)}>NOVA AVALIAÇÃO</button>
        </div>}
      </section>}

      {module === "hands" && <section className="panel"><div className="eyebrow">AI HAND REVIEW</div><h2>ANÁLISE DE MÃOS</h2><PokerTable/><textarea placeholder="Descreva a mão, stacks, posições e ação..."/><button className="primary">ANALISAR MÃO</button><div className="coming">Interface pronta para receber parsing estruturado e análise do backend.</div></section>}

      {module === "ai" && <section className="panel"><div className="eyebrow">POKER ASSISTANT</div><h2>PERGUNTE À IA</h2><p>Regras, estratégia, situações de sessão e dúvidas gerais de poker.</p><textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="O que você quer entender?"/><button className="primary">PERGUNTAR</button><div className="coming">Interface pronta para conexão do backend de IA.</div></section>}

      {module === "math" && <section className="math-shell">
        <div className="section-head"><div><div className="eyebrow">POKER MATH LAB</div><h2>MATEMÁTICA DO POKER</h2></div><div className="math-tabs">{(["concepts","practice","doubts"] as MathTab[]).map(t=><button key={t} className={mathTab===t?"active":""} onClick={()=>setMathTab(t)}>{t === "concepts" ? "CONCEITOS" : t === "practice" ? "PRÁTICA" : "DÚVIDAS"}</button>)}</div></div>
        {mathTab === "concepts" && <div className="concept-layout"><aside>{mathConcepts.map(c=><button key={c.id} className={conceptId===c.id?"active":""} onClick={()=>setConceptId(c.id)}>{c.title}</button>)}</aside><article className="explanation"><span className="tag">CONCEITO</span><h3>{concept.title}</h3><Info title="O QUE É" text={concept.what}/><Info title="PARA QUE SERVE" text={concept.purpose}/><Info title="COMO CALCULAR" text={concept.formula}/><Info title="QUANDO USAR" text={concept.when}/><Info title="EXEMPLO" text={concept.example}/><Info title="NA MESA" text={concept.table}/><button className="voice" onClick={speak}>▶ OUVIR EXPLICAÇÃO</button></article></div>}
        {mathTab === "practice" && <div className="practice"><div><span className="tag">INTERMEDIÁRIO · POT ODDS</span><h3>VOCÊ TEM O PREÇO CERTO?</h3><PokerTable/><div className="scenario"><span>POTE NO TURN <b>80</b></span><span>VILLAIN BET <b>40</b></span><span>CALL <b>40</b></span></div></div><div className="question"><p>Qual é a equity mínima necessária para o call?</p><div className="answer"><input inputMode="decimal" value={answer} onChange={e=>{setAnswer(e.target.value);setChecked(false)}} placeholder="0"/><b>%</b></div><button className="primary" onClick={()=>setChecked(true)}>VERIFICAR</button>{checked && <div className={correct?"feedback ok":"feedback bad"}><strong>{correct?"CORRETO · 25%":"REVISE O CÁLCULO"}</strong><p>Call ÷ pote final = 40 ÷ (80 + 40 + 40) = 25%.</p><small>NA MESA: se sua equity contra o range for maior que 25%, o call supera o breakeven considerando apenas o preço atual.</small></div>}</div></div>}
        {mathTab === "doubts" && <div className="doubts"><div className="doubt-card"><span className="tag">DÚVIDA LIVRE</span><h3>PERGUNTE SOBRE MATEMÁTICA</h3><textarea placeholder="Ex.: Qual a diferença entre pot odds e implied odds?"/><button className="primary">EXPLICAR</button></div><div className="doubt-card"><span className="tag">DÚVIDA SOBRE UMA MÃO</span><h3>CALCULADORA DE SPOT</h3><div className="calc-grid"><label>Pote<input value={potValue} onChange={e=>setPotValue(e.target.value)} inputMode="decimal"/></label><label>Aposta<input value={betValue} onChange={e=>setBetValue(e.target.value)} inputMode="decimal"/></label><label>Stack efetivo<input value={stackValue} onChange={e=>setStackValue(e.target.value)} inputMode="decimal"/></label></div><div className="metrics"><Metric label="EQUITY MÍNIMA" value={percent(requiredEquity(safePot,safeBet))}/><Metric label="SPR" value={spr(safeStack,safePot || 1).toFixed(1)}/><Metric label="MDF" value={percent(mdf(safePot,safeBet))}/></div><small className="exact">● DADOS EXATOS — recalculados em tempo real a partir dos valores informados.</small></div></div>}
      </section>}
    </main>
  );
}

function Info({title,text}:{title:string;text:string}) { return <div className="info"><b>{title}</b><p>{text}</p></div> }
function Metric({label,value}:{label:string;value:string}) { return <div className="metric"><small>{label}</small><strong>{value}</strong></div> }
