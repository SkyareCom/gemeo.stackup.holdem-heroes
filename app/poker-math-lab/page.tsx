import Link from "next/link";
import MathLabWorkspace from "@/components/MathLabWorkspace";
import BackButton from "@/components/BackButton";
import StackupAppHeader from "@/components/StackupAppHeader";

export default function PokerMathLabPage(){return <main className="module-page"><StackupAppHeader/><nav className="module-navigation" aria-label="NAVEGAÇÃO DO MÓDULO"><BackButton/><Link className="module-back" href="/">⌂ MENU PRINCIPAL</Link></nav><section className="panel"><MathLabWorkspace/></section></main>}
