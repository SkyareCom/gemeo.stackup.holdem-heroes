import Link from "next/link";
import HandReviewWorkspace from "@/components/HandReviewWorkspace";
import BackButton from "@/components/BackButton";
import StackupAppHeader from "@/components/StackupAppHeader";

export default function AiHandReviewPage(){return <main className="module-page ai-hand-review-page"><StackupAppHeader/><nav className="module-navigation" aria-label="NAVEGAÇÃO DO MÓDULO"><BackButton/><Link className="module-back" href="/">⌂ MENU PRINCIPAL</Link></nav><HandReviewWorkspace/></main>}
