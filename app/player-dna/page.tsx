import Link from "next/link";
import StackupAppHeader from "@/components/StackupAppHeader";
import PlayerDnaWorkspace from "@/components/PlayerDnaWorkspace";
import PlayerDnaFixedActions from "@/components/PlayerDnaFixedActions";
import PlayerDnaUiEnforcer from "@/components/PlayerDnaUiEnforcer";
import "./player-dna-typography.css";
import "./player-dna-selection-contrast.css";
import "./player-dna-footer-controls.css";
import "./player-dna-blue-template.css";
import "./player-dna-contrast-blue.css";
import "./player-dna-ui-contract.css";
import "./player-dna-training-cleanup.css";

export default function PlayerDnaPage(){
  return <main className="module-page player-dna-page">
    <PlayerDnaUiEnforcer/>
    <StackupAppHeader/>
    <nav className="module-navigation player-dna-navigation" aria-label="NAVEGAÇÃO DO MÓDULO">
      <Link className="module-back player-dna-nav-button" href="/">‹ VOLTAR</Link>
      <Link className="module-back player-dna-nav-button" href="/">⌂ MENU PRINCIPAL</Link>
    </nav>
    <section className="panel profile-panel">
      <PlayerDnaFixedActions/>
      <PlayerDnaWorkspace/>
    </section>
  </main>;
}
