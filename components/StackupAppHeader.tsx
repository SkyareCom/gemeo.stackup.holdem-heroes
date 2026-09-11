import Link from "next/link";

export default function StackupAppHeader(){
  return <header className="stackup-app-header" aria-label="STACKUP HOLD'EM HEROES">
    <Link className="stackup-brand-lockup" href="/" aria-label="STACKUP HOLD'EM HEROES — INÍCIO">
      <span className="stackup-logo" aria-hidden="true"><span>♠</span></span>
      <span className="stackup-brand-copy">
        <strong className="stackup-app-title"><span>STACKUP HOLD&apos;EM</span><span>HEROES</span></strong>
        <span className="stackup-app-subtitle">AI POKER PERFORMANCE SYSTEM</span>
      </span>
    </Link>
    <span className="stackup-header-spade" aria-hidden="true">♠</span>
  </header>;
}
