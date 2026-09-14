"use client";

import { usePathname } from "next/navigation";

const HOME_PATHS = new Set([
  "/",
  "/gemeo.stackup.holdem-heroes",
  "/gemeo.stackup.holdem-heroes/",
]);

export default function HomeFooterExtension() {
  const pathname = usePathname();
  if (!HOME_PATHS.has(pathname)) return null;

  return (
    <section id="homeExtraSection" data-manual-type-scale="true" aria-label="IDIOMA PRINCIPAL E MENSAGEM FINAL">
      <style>{`
        html body #homeExtraSection{
          width:min(100vw,864px)!important;
          margin:0 auto!important;
          padding:14px 5.21% 38px!important;
          background:#031a31!important;
          font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
          box-sizing:border-box!important;
        }
        html body #homeLanguageCard{
          width:100%!important;
          min-height:96px!important;
          display:grid!important;
          grid-template-columns:72px minmax(0,1fr) 28px!important;
          align-items:center!important;
          gap:14px!important;
          padding:10px 14px!important;
          margin:0!important;
          border:3px solid #148fe3!important;
          border-radius:22px!important;
          background:#f7fbff!important;
          box-shadow:0 0 0 2px rgba(104,205,255,.28),0 7px 18px rgba(0,0,0,.24)!important;
          color:#08134c!important;
          box-sizing:border-box!important;
        }
        html body #homeLanguageIcon{
          width:72px!important;
          height:72px!important;
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          border:2px solid #1c91df!important;
          border-radius:16px!important;
          background:#06254a!important;
          box-shadow:inset 0 0 14px rgba(29,163,255,.18)!important;
          color:#dff6ff!important;
          box-sizing:border-box!important;
        }
        html body #homeLanguageIcon svg{
          width:46px!important;
          height:46px!important;
          display:block!important;
          fill:none!important;
          stroke:#dff6ff!important;
          stroke-width:2!important;
          stroke-linecap:round!important;
          stroke-linejoin:round!important;
        }
        html body #homeLanguageText{
          min-width:0!important;
          display:flex!important;
          flex-direction:column!important;
          justify-content:center!important;
          gap:7px!important;
        }
        html body #homeLanguageTitle{
          margin:0!important;
          padding:0!important;
          font-size:20px!important;
          line-height:1!important;
          font-weight:400!important;
          color:#08134c!important;
          -webkit-text-fill-color:#08134c!important;
          white-space:nowrap!important;
          text-align:left!important;
        }
        html body #homeLanguageCopy{
          margin:0!important;
          padding:0!important;
          font-size:14px!important;
          line-height:1.22!important;
          font-weight:400!important;
          color:#26355e!important;
          -webkit-text-fill-color:#26355e!important;
          text-align:left!important;
          text-transform:none!important;
          white-space:normal!important;
          overflow-wrap:normal!important;
        }
        html body #homeLanguageArrow{
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          width:28px!important;
          height:54px!important;
          margin:0!important;
          padding:0!important;
          font-size:44px!important;
          line-height:1!important;
          color:#108ee1!important;
          -webkit-text-fill-color:#108ee1!important;
          text-shadow:0 0 6px rgba(16,142,225,.28)!important;
        }
        html body #homeMotto{
          width:100%!important;
          margin:30px 0 0!important;
          padding:0 0 4px!important;
          display:flex!important;
          align-items:baseline!important;
          justify-content:center!important;
          gap:8px!important;
          white-space:nowrap!important;
          text-align:center!important;
          font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
        }
        html body #homeMottoUnderstand{
          font-size:18px!important;
          line-height:1!important;
          color:#fff!important;
          -webkit-text-fill-color:#fff!important;
          text-shadow:0 2px 3px rgba(0,0,0,.5)!important;
        }
        html body #homeMottoTrain{
          font-size:20px!important;
          line-height:1!important;
          color:#fff!important;
          -webkit-text-fill-color:#fff!important;
          text-shadow:0 2px 3px rgba(0,0,0,.5)!important;
        }
        html body #homeMottoEvolve{
          font-size:26px!important;
          line-height:1!important;
          color:#23b8ff!important;
          -webkit-text-fill-color:#23b8ff!important;
          text-shadow:0 2px 2px rgba(0,10,35,.95),0 0 6px rgba(32,184,255,.85),0 0 12px rgba(0,157,255,.52)!important;
        }
        @media (min-width:600px){
          html body #homeExtraSection{padding-top:18px!important;padding-bottom:46px!important}
          html body #homeLanguageCard{min-height:118px!important;grid-template-columns:88px minmax(0,1fr) 38px!important;padding:14px 18px!important;gap:18px!important}
          html body #homeLanguageIcon{width:88px!important;height:88px!important;border-radius:20px!important}
          html body #homeLanguageIcon svg{width:54px!important;height:54px!important}
          html body #homeLanguageArrow{width:38px!important;font-size:52px!important}
        }
      `}</style>

      <div id="homeLanguageCard">
        <div id="homeLanguageIcon" aria-hidden="true">
          <svg viewBox="0 0 48 48" focusable="false" aria-hidden="true">
            <circle cx="24" cy="24" r="18" />
            <path d="M6 24h36M24 6c5 5 8 11 8 18s-3 13-8 18M24 6c-5 5-8 11-8 18s3 13 8 18" />
          </svg>
        </div>
        <div id="homeLanguageText">
          <div id="homeLanguageTitle">IDIOMA PRINCIPAL</div>
          <div id="homeLanguageCopy" data-preserve-case="true">Escolha o idioma para usar no aplicativo</div>
        </div>
        <div id="homeLanguageArrow" aria-hidden="true">›</div>
      </div>

      <div id="homeMotto" aria-label="ENTENDA. TREINE. EVOLUA.">
        <span id="homeMottoUnderstand">ENTENDA.</span>
        <span id="homeMottoTrain">TREINE.</span>
        <span id="homeMottoEvolve">EVOLUA.</span>
      </div>
    </section>
  );
}
