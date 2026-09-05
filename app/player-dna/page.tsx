import Link from "next/link";
import BackButton from "@/components/BackButton";
import PlayerDnaWorkspace from "@/components/PlayerDnaWorkspace";

export default function PlayerDnaPage(){
  return <main className="module-page player-dna-page">
    <nav className="module-navigation" aria-label="Navegação do módulo">
      <BackButton eventName="player-dna-previous"/>
      <Link className="module-back" href="/">MÓDULOS</Link>
    </nav>
    <section className="panel profile-panel">
      <style>{`
        .training-session{gap:6px!important}
        .training-session>[aria-label="Mesa de poker animada Player DNA"]{margin-top:-10px!important;margin-bottom:-52px!important}
        .training-session>p{display:none!important}
        .training-session>div[aria-busy]{margin-top:0!important}
        @media(max-width:800px){
          .training-session{gap:4px!important}
          .training-session>[aria-label="Mesa de poker animada Player DNA"]{margin-top:-16px!important;margin-bottom:-58px!important}
        }
      `}</style>
      <PlayerDnaWorkspace/>
    </section>
  </main>;
}
