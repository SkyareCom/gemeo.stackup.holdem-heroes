import Link from "next/link";

const HEROES_LOGO_SRC = "/gemeo.stackup.holdem-heroes/stackup-heroes-logo-v2.svg?v=20260911-0949";

export default function StackupAppHeader(){
  return <header className="stackup-app-header" aria-label="STACKUP HOLD'EM HEROES">
    <Link className="stackup-brand-lockup" href="/" aria-label="STACKUP HOLD'EM HEROES — INÍCIO">
      <span className="stackup-logo" aria-hidden="true">
        <img className="stackup-logo-image" src={HEROES_LOGO_SRC} alt="" width="128" height="128" />
      </span>
      <span className="stackup-brand-copy">
        <strong className="stackup-app-title"><span>STACKUP HOLD&apos;EM</span><span>HEROES</span></strong>
        <span className="stackup-app-subtitle">AI POKER PERFORMANCE SYSTEM</span>
      </span>
    </Link>
    <span className="stackup-header-deck" aria-hidden="true">
      <span className="stackup-header-card stackup-header-card-back">A♠</span>
      <span className="stackup-header-card stackup-header-card-front">A♠</span>
    </span>
  </header>;
}
