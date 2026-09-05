import Link from "next/link";
import BackButton from "@/components/BackButton";
import PlayerDnaWorkspace from "@/components/PlayerDnaWorkspace";
import "./player-dna-typography.css";

export default function PlayerDnaPage(){
  return <main className="module-page player-dna-page">
    <nav className="module-navigation" aria-label="Navegação do módulo">
      <BackButton eventName="player-dna-previous"/>
      <Link className="module-back" href="/">MÓDULOS</Link>
    </nav>
    <section className="panel profile-panel">
      <PlayerDnaWorkspace/>
    </section>
  </main>;
}
