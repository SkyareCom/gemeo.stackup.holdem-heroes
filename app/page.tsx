import Link from "next/link";
import StackupAppHeader from "@/components/StackupAppHeader";
import "./home-cards.css";

const modules=[
  {href:"/player-dna",number:"01",title:"PLAYER DNA",description:"DESCUBRA SEU PERFIL TÉCNICO COM SPOTS DE TREINO VARIADOS."},
  {href:"/poker-math-lab",number:"02",title:"MATEMÁTICA DO POKER",description:"APRENDA ODDS, POT ODDS, MDF, SPR E CONCEITOS ESSENCIAIS."},
  {href:"/ai-hand-review",number:"03",title:"ANÁLISE DE MÃOS",description:"ENVIE CENÁRIOS COMPLETOS E RECEBA AVALIAÇÃO ESTRATÉGICA."},
  {href:"/poker-assistant",number:"04",title:"PERGUNTE À IA",description:"TIRE DÚVIDAS SOBRE POKER, ESTRATÉGIA, RANGES E DECISÕES."},
];

export default function Home(){
  return <main className="stackup-home">
    <StackupAppHeader/>
    <section className="stackup-home-intro">
      <h1 className="stackup-home-title">
        <span className="stackup-home-title-line stackup-home-title-line-small">TREINE. ENTENDA.</span>
        <span className="stackup-home-title-line stackup-home-title-line-main">EVOLUA.</span>
      </h1>
      <p className="stackup-home-lead">INTELIGÊNCIA ARTIFICIAL, TREINO E ANÁLISE DE POKER PARA ELEVAR O SEU DESEMPENHO A UM NOVO NÍVEL.</p>
    </section>
    <nav className="modules" aria-label="MÓDULOS STACKUP">
      {modules.map(item=><Link key={item.href} href={item.href}>
        <span className="module-number">{item.number}</span>
        <span className="module-copy"><strong className="module-title">{item.title}</strong><span className="module-description">{item.description}</span></span>
        <span className="module-chevron" aria-hidden="true">›</span>
      </Link>)}
    </nav>
  </main>;
}
