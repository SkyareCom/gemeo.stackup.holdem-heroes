import Link from "next/link";
import PokerAssistantWorkspace from "@/components/PokerAssistantWorkspace";
import BackButton from "@/components/BackButton";
import StackupAppHeader from "@/components/StackupAppHeader";

export default function PokerAssistantPage(){return <main className="module-page"><StackupAppHeader/><nav className="module-navigation" aria-label="NAVEGAÇÃO DO MÓDULO"><BackButton/><Link className="module-back" href="/">⌂ MENU PRINCIPAL</Link></nav><section className="panel"><PokerAssistantWorkspace/></section></main>}
