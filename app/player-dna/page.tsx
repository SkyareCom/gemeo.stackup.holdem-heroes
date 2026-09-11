import Link from "next/link";
import PlayerDnaWorkspace from "@/components/PlayerDnaWorkspace";
import PlayerDnaFixedActions from "@/components/PlayerDnaFixedActions";
import "./player-dna-typography.css";
import "./player-dna-selection-contrast.css";

export default function PlayerDnaPage(){
  return <main className="module-page player-dna-page">
    <nav className="module-navigation player-dna-navigation" aria-label="NAVEGAÇÃO DO MÓDULO">
      <Link className="module-back player-dna-nav-button" href="/">← ANTERIOR</Link>
      <Link className="module-back player-dna-nav-button" href="/">MÓDULOS</Link>
    </nav>
    <section className="panel profile-panel">
      <PlayerDnaFixedActions/>
      <PlayerDnaWorkspace/>
    </section>
  </main>;
}
