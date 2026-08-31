import Link from "next/link";
import PlayerDnaWorkspace from "@/components/PlayerDnaWorkspace";

export default function PlayerDnaPage(){return <main className="module-page player-dna-page"><Link className="module-back" href="/">← MÓDULOS</Link><section className="panel profile-panel"><PlayerDnaWorkspace/></section></main>}
