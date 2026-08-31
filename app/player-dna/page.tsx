import Link from "next/link";
import StackupEvolutionWorkspace from "@/components/StackupEvolutionWorkspace";
import PlayerDnaWorkspace from "@/components/PlayerDnaWorkspace";

export default function PlayerDnaPage(){return <main className="module-page player-dna-page"><Link className="module-back" href="/">← MÓDULOS</Link><section className="panel profile-panel"><StackupEvolutionWorkspace/><PlayerDnaWorkspace/></section></main>}
