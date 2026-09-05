"use client";

import { useState } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import PlayerDnaPokerTable from "@/components/PlayerDnaPokerTable";
import PlayerDnaWorkspace from "@/components/PlayerDnaWorkspace";

export default function PlayerDnaPage(){
  const [analysisStarted,setAnalysisStarted]=useState(false);

  return <main className="module-page player-dna-page">
    <nav className="module-navigation" aria-label="Navegação do módulo">
      <BackButton eventName="player-dna-previous"/>
      <Link className="module-back" href="/">MÓDULOS</Link>
    </nav>

    <section className="panel profile-panel">
      {!analysisStarted ? <>
        <div className="eyebrow">PLAYER DNA</div>
        <h2>DESCUBRA SEU PERFIL</h2>
        <PlayerDnaPokerTable/>
        <button type="button" className="primary player-dna-start" onClick={()=>setAnalysisStarted(true)}>INICIAR ANÁLISE</button>
      </> : <PlayerDnaWorkspace/>}
    </section>
  </main>;
}
