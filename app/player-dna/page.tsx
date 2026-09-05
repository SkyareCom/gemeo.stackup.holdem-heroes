import Link from "next/link";
import BackButton from "@/components/BackButton";

export default function PlayerDnaPage(){
  return <main className="module-page player-dna-page">
    <nav className="module-navigation" aria-label="Navegação do módulo">
      <BackButton eventName="player-dna-previous"/>
      <Link className="module-back" href="/">MÓDULOS</Link>
    </nav>
  </main>;
}
