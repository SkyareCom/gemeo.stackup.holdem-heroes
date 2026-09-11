import Link from "next/link";
import StackupAppHeader from "@/components/StackupAppHeader";
import "./home-cards.css";

const modules=[
  {href:"/player-dna",icon:"dna",title:"PLAYER DNA",description:"Descubra seu perfil técnico com spots de treino variados."},
  {href:"/poker-math-lab",icon:"math",title:"MATEMÁTICA DO POKER",description:"Aprenda odds, pot odds, MDF, SPR e conceitos essenciais."},
  {href:"/ai-hand-review",icon:"cards",title:"ANÁLISE DE MÃOS",description:"Envie cenários completos e receba avaliação estratégica."},
  {href:"/poker-assistant",icon:"ai",title:"PERGUNTE À IA",description:"Tire dúvidas sobre poker, estratégia, ranges e decisões."},
] as const;

function ModuleIcon({type}:{type:(typeof modules)[number]["icon"]}){
  if(type==="dna") return <svg viewBox="0 0 64 64" role="img" aria-hidden="true"><circle cx="22" cy="18" r="9"/><path d="M8 49c0-10 6-17 14-17s14 7 14 17v3H8z"/><path className="icon-stroke" d="M40 14c12 6 12 28 0 35M53 14c-12 6-12 28 0 35M42 19h9M39 27h15M39 36h15M42 44h9"/></svg>;
  if(type==="math") return <svg viewBox="0 0 64 64" role="img" aria-hidden="true"><rect x="9" y="35" width="10" height="18" rx="2"/><rect x="27" y="25" width="10" height="28" rx="2"/><rect x="45" y="12" width="10" height="41" rx="2"/></svg>;
  if(type==="cards") return <svg viewBox="0 0 64 64" role="img" aria-hidden="true"><rect className="icon-stroke" x="12" y="12" width="29" height="39" rx="4" transform="rotate(-10 26.5 31.5)"/><rect className="icon-stroke" x="25" y="14" width="28" height="39" rx="4" transform="rotate(8 39 33.5)"/><path d="M40 26c-4 5-8 8-8 12a6 6 0 0 0 11 3c0 4-2 7-5 9h9c-3-2-5-5-5-9a6 6 0 0 0 11-3c0-4-5-7-13-12z"/></svg>;
  return <svg viewBox="0 0 64 64" role="img" aria-hidden="true"><path className="icon-stroke" d="M32 8v8M28 8a4 4 0 1 1 8 0"/><rect className="icon-stroke" x="12" y="18" width="40" height="32" rx="10"/><circle cx="24" cy="33" r="4"/><circle cx="40" cy="33" r="4"/><path className="icon-stroke" d="M23 42h18M12 28H7v14h5M52 28h5v14h-5"/></svg>;
}

export default function Home(){
  return <main className="stackup-home stackup-home-template-v2">
    <StackupAppHeader/>

    <section className="stackup-home-hero" aria-labelledby="stackup-home-heading">
      <div className="stackup-hero-copy">
        <h1 id="stackup-home-heading" className="stackup-hero-title">
          <span>TREINE.</span>
          <span>ENTENDA.</span>
          <span>EVOLUA.</span>
        </h1>
        <p className="stackup-hero-lead" data-preserve-case="true">Aprenda como você joga. Descubra seus leaks.<br/>E aperfeiçoe o seu poker.</p>
      </div>
      <div className="stackup-hero-visual" aria-hidden="true">
        <span className="stackup-chip-stack stackup-chip-stack-back"><i/><i/><i/><i/></span>
        <span className="stackup-chip-stack stackup-chip-stack-front"><i/><i/><i/></span>
        <span className="stackup-hero-medallion">♠</span>
      </div>
    </section>

    <nav className="modules stackup-home-modules" aria-label="MÓDULOS STACKUP">
      {modules.map(item=><Link key={item.href} href={item.href}>
        <span className="module-icon" aria-hidden="true"><ModuleIcon type={item.icon}/></span>
        <span className="module-copy"><strong className="module-title">{item.title}</strong><span className="module-description" data-preserve-case="true">{item.description}</span></span>
        <span className="module-chevron" aria-hidden="true">›</span>
      </Link>)}
    </nav>

    <footer className="stackup-home-footer" aria-label="STACKUP HOLD'EM HEROES">
      <span aria-hidden="true"/>
      <p>EVOLUA SEU JOGO. UMA DECISÃO DE CADA VEZ.</p>
      <span aria-hidden="true"/>
    </footer>
  </main>;
}
