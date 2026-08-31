import Link from "next/link";
import HandVisionImport from "@/components/HandVisionImport";
import HandReviewWorkspace from "@/components/HandReviewWorkspace";

export default function AiHandReviewPage(){return <main className="module-page"><Link className="module-back" href="/">← MÓDULOS</Link><section className="panel"><HandVisionImport/><HandReviewWorkspace/></section></main>}
