import Link from "next/link";

const LOGO_SRC="/gemeo.stackup.holdem-heroes/stackup-heroes-logo-128-valid-20260911.png";

export default function StackupAppHeader(){
  return <header className="stackup-internal-brand-header" aria-label="STACKUP HOLD'EM HEROES">
    <Link className="stackup-internal-brand-link" href="/" aria-label="STACKUP HOLD'EM HEROES — INÍCIO">
      <span className="stackup-internal-logo-wrap" aria-hidden="true"><img className="stackup-internal-logo" src={LOGO_SRC} alt="" width="128" height="128" draggable={false}/></span>
      <span className="stackup-internal-brand-copy">
        <span className="stackup-internal-brand-name">STACKUP HOLD’EM</span>
        <span className="stackup-internal-brand-heroes">HEROES</span>
        <span className="stackup-internal-brand-subtitle">AI POKER PERFORMANCE SYSTEM</span>
      </span>
    </Link>
  </header>;
}
