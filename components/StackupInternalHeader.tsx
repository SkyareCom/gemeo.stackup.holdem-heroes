import Link from "next/link";
import "@/app/internal-visual-system.css";

const HEROES_LOGO_SRC = "/gemeo.stackup.holdem-heroes/stackup-heroes-logo-128-valid-20260911.png";

export default function StackupInternalHeader(){
  return (
    <header className="stackup-app-header">
      <Link className="stackup-app-header-link" href="/">
        <img className="stackup-app-header-logo" src={HEROES_LOGO_SRC} alt="" width="128" height="128" />
        <span className="stackup-app-header-copy">
          <span className="stackup-app-header-brand">STACKUP HOLD&apos;EM</span>
          <span className="stackup-app-header-heroes">HEROES</span>
          <span className="stackup-app-header-subtitle">AI POKER PERFORMANCE SYSTEM</span>
        </span>
      </Link>
    </header>
  );
}
