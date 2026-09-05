import Link from "next/link";
import "./home-cards.css";

const modules = [
  {href:"/player-dna",line1:"PLAYER",line2:"DNA",description:"Descubra seu perfil de decisões em diferentes cenários de jogo."},
  {href:"/ai-hand-review",line1:"AI HAND",line2:"REVIEW",description:"Importe, reconstrua e analise suas mãos com IA."},
  {href:"/poker-assistant",line1:"POKER",line2:"ASSISTANT",description:"Tire dúvidas sobre regras, estratégias, ranges etc..."},
  {href:"/poker-math-lab",line1:"POKER",line2:"MATH LAB",description:"Aprenda e pratique odds, outs, SPR, equity e muito mais..."},
];

export default function Home(){
  return <main>
    <header className="topbar"><div><span className="brand">STACKUP HOLD&apos;EM HEROES</span></div><span className="status">● AI POKER PERFORMANCE SYSTEM</span></header>
    <section className="hero"><p className="system-gradient" style={{display:"inline-block",width:"max-content",maxWidth:"100%"}}>AI POKER<br/>PERFORMANCE<br/>SYSTEM.</p><h1><span className="hero-lead">DESCUBRA. <em>ENTENDA.</em></span><br/><span className="hero-evolve">EVOLUA.</span></h1></section>
    <nav className="modules" aria-label="Módulos STACKUP">{modules.map(item=><Link key={item.href} href={item.href}><strong className="module-title"><span>{item.line1}</span><span>{item.line2}</span></strong><span className="module-description">{item.description}</span></Link>)}</nav>
  </main>;
}
