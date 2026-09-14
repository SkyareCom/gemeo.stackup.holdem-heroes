import Link from "next/link";
import HandReviewWorkspace from "@/components/HandReviewWorkspace";
import BackButton from "@/components/BackButton";

export default function AiHandReviewPage(){return <main className="module-page ai-hand-review-page"><nav className="module-navigation" aria-label="NAVEGAÇÃO DO MÓDULO"><BackButton/><Link className="module-back" href="/">⌂ MENU PRINCIPAL</Link></nav><section className="panel hand-review-panel"><HandReviewWorkspace/></section></main>}
