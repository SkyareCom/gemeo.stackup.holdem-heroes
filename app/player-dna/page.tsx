import Link from "next/link";
import BackButton from "@/components/BackButton";
import PlayerDnaPokerTable from "@/components/PlayerDnaPokerTable";
import PlayerDnaWorkspace from "@/components/PlayerDnaWorkspace";

export default function PlayerDnaPage(){
  return <main className="module-page player-dna-page">
    <nav className="module-navigation" aria-label="Navegação do módulo">
      <BackButton eventName="player-dna-previous"/>
      <Link className="module-back" href="/">MÓDULOS</Link>
    </nav>

    <section className="panel profile-panel">
      <style>{`
        .player-dna-operation-table{display:none}
        .profile-panel:has(.training-session) .player-dna-operation-table{display:block}
        .profile-panel:has(.training-session) .player-dna-operation-table + .player-dna-workspace-shell{margin-top:18px}
      `}</style>
      <div className="player-dna-operation-table">
        <div className="eyebrow">PLAYER DNA · OPERAÇÃO</div>
        <h2>MESA DE ANÁLISE</h2>
        <PlayerDnaPokerTable/>
      </div>
      <div className="player-dna-workspace-shell">
        <PlayerDnaWorkspace/>
      </div>
    </section>
  </main>;
}
