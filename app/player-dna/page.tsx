import Link from "next/link";
import PlayerDnaWorkspace from "@/components/PlayerDnaWorkspace";
import "./player-dna-typography.css";

export default function PlayerDnaPage(){
  return <main className="module-page player-dna-page">
    <nav className="module-navigation player-dna-navigation" aria-label="Navegação do módulo">
      <Link className="module-back player-dna-nav-button" href="/">← ANTERIOR</Link>
      <Link className="module-back player-dna-nav-button" href="/">MÓDULOS</Link>
    </nav>
    <section className="panel profile-panel">
      <PlayerDnaWorkspace/>
    </section>
  </main>;
}
