"use client";

import { useState } from "react";

type Module = "home" | "profile" | "hands" | "ai";

const profileDepths = [
  [100, "Perfil inicial / análise rápida"],
  [300, "Análise intermediária"],
  [500, "Análise avançada"],
  [1000, "Perfil de alta robustez"],
  [3000, "Análise profunda do jogador"],
] as const;

export default function Home() {
  const [module, setModule] = useState<Module>("home");
  const [selectedDepth, setSelectedDepth] = useState<number | null>(null);
  const [handText, setHandText] = useState("");
  const [question, setQuestion] = useState("");

  return (
    <main>
      <header className="topbar">
        <button className="logo" onClick={() => setModule("home")}><span>STACKUP</span> HOLD&apos;EM <b>AI SOLVER</b></button>
        <span className="status">● PLAYER INTELLIGENCE SYSTEM</span>
      </header>

      {module === "home" && <>
        <section className="hero">
          <p>POKER · SOLVER · IA · DADOS</p>
          <h1>ELE NÃO APENAS ENSINA POKER.<br/><em>ELE APRENDE COMO VOCÊ JOGA.</em></h1>
          <div className="hero-copy">Decisões simuladas, mãos reais e dúvidas conectadas para construir uma leitura progressiva do seu jogo.</div>
        </section>
        <section className="home-grid">
          <ModuleCard number="01" eyebrow="PLAYER DNA" title="PERFIL DE JOGADOR" text="Descubra como você realmente joga." action="DESCOBRIR PERFIL" onClick={() => setModule("profile")} />
          <ModuleCard number="02" eyebrow="AI HAND REVIEW" title="ANÁLISE DE MÃOS" text="Conte uma mão. A IA reconstrói e analisa suas decisões." action="ANALISAR UMA MÃO" onClick={() => setModule("hands")} />
          <ModuleCard number="03" eyebrow="POKER ASSISTANT" title="PERGUNTE À IA" text="Estratégia, regras, situações e dúvidas sobre poker." action="FAZER UMA PERGUNTA" onClick={() => setModule("ai")} />
        </section>
        <section className="memory-strip"><div><small>MEMÓRIA COMPARTILHADA</small><strong>UM JOGADOR · UM CONTEXTO · UMA EVOLUÇÃO</strong></div><p>Perfil, mãos reais e conhecimento estudado formarão uma camada estruturada única — não apenas um histórico de chat.</p></section>
      </>}

      {module === "profile" && <section className="workspace">
        <Back onClick={() => setModule("home")}/><div className="eyebrow">PLAYER DNA</div><h2>DESCUBRA COMO VOCÊ REALMENTE JOGA.</h2>
        {!selectedDepth ? <><p className="lead">Escolha apenas a profundidade da análise. O sistema selecionará automaticamente uma amostra variada e balanceada de situações de poker.</p><div className="depth-grid">{profileDepths.map(([n,label]) => <button key={n} onClick={() => setSelectedDepth(n)}><strong>{n}</strong><span>SPOTS</span><small>{label}</small></button>)}</div><div className="truth-note"><b>MAIS DECISÕES → MAIS DADOS</b><span>Cada nova decisão aumenta a quantidade de dados analisados e melhora a robustez e a confiabilidade da leitura do seu estilo de jogo.</span></div></> : <SpotSession depth={selectedDepth} onReset={() => setSelectedDepth(null)}/>} 
      </section>}

      {module === "hands" && <section className="workspace"><Back onClick={() => setModule("home")}/><div className="eyebrow purple">AI HAND REVIEW</div><h2>CONTE UMA MÃO.</h2><p className="lead">Escreva naturalmente. Você não precisa preencher dezenas de campos se o relato já contém as informações.</p><div className="hand-layout"><div><textarea value={handText} onChange={e=>setHandText(e.target.value)} placeholder="Ex.: Eu estava no BTN com AK, blinds 1k/2k, tinha 45bb, CO abriu 2.2x, eu 3betei..."/><div className="quick-fields"><input placeholder="Cash / Torneio"/><input placeholder="Blinds"/><input placeholder="Stack efetivo"/></div><button className="primary purple-btn">RECONSTRUIR E ANALISAR</button></div><SharedTable/></div><div className="analysis-preview"><Result title="O QUE ACONTECEU" text="A reconstrução street-by-street aparecerá aqui após a interpretação da mão."/><Result title="ANÁLISE" text="Ranges, posição, stack, SPR, pot odds, blockers, sizing, GTO, exploit e ICM quando aplicável."/><Result title="MELHOR LINHA" text="A recomendação será separada das alternativas e das hipóteses utilizadas."/><Result title="PONTO PRINCIPAL DA MÃO" text="O aprendizado central será destacado e poderá alimentar o perfil do jogador."/></div></section>}

      {module === "ai" && <section className="workspace"><Back onClick={() => setModule("home")}/><div className="eyebrow purple">POKER ASSISTANT</div><h2>PERGUNTE À IA.</h2><p className="lead">Estratégia, regras, acontecimentos e situações de poker — sem confundir uma dúvida geral com análise formal de uma mão.</p><div className="ask-box"><textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ex.: Dois jogadores foram eliminados na mesma mão. Quem fica melhor colocado?"/><button className="primary purple-btn">PERGUNTAR</button></div><div className="rule-note"><b>CONTEXTO DE REGRAS</b><span>O sistema deverá distinguir regra universal, torneio, cash game, regulamento específico e decisões que dependem do floor.</span></div></section>}
    </main>
  );
}

function ModuleCard({number,eyebrow,title,text,action,onClick}:{number:string;eyebrow:string;title:string;text:string;action:string;onClick:()=>void}) { return <button className="module-card" onClick={onClick}><span className="card-number">{number}</span><small>{eyebrow}</small><h3>{title}</h3><p>{text}</p><b>{action} →</b></button> }
function Back({onClick}:{onClick:()=>void}) { return <button className="back" onClick={onClick}>← HOME</button> }
function Result({title,text}:{title:string;text:string}) { return <div className="result"><b>{title}</b><p>{text}</p></div> }

function SharedTable() { return <div className="table-wrap"><div className="poker-table"><span className="seat top">VILLAIN · CO</span><div className="board"><b>A♠</b><b>7♥</b><b>2♣</b><i>?</i><i>?</i></div><div className="pot">POT <strong>—</strong></div><span className="seat bottom">HERO · BTN · A♦ K♦</span></div></div> }

function SpotSession({depth,onReset}:{depth:number;onReset:()=>void}) {
  const [decision,setDecision] = useState<string | null>(null);
  return <div className="spot-session"><div className="session-head"><div><small>AMOSTRA SELECIONADA</small><strong>{depth} SPOTS</strong></div><button onClick={onReset}>ALTERAR</button></div><SharedTable/><div className="spot-meta"><span>TORNEIO</span><span>40 BB</span><span>BTN vs BB</span><span>SINGLE-RAISED POT</span><span>FLOP</span></div><h3>QUAL É A SUA DECISÃO?</h3><div className="actions">{["FOLD","CHECK","CALL","BET 33%","BET 75%","ALL-IN"].map(a=><button className={decision===a?"selected":""} key={a} onClick={()=>setDecision(a)}>{a}</button>)}</div>{decision && <div className="decision-record"><b>DECISÃO REGISTRADA: {decision}</b><span>O Profile Engine registrará contexto, posição, street, stack, sizing e decisão para análise multidimensional.</span><button>PRÓXIMO SPOT →</button></div>}</div>
}
