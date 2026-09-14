"use client";

export default function HomeFooterExtension() {
  return (
    <section id="homeExtraSection" data-manual-type-scale="true" aria-label="IDIOMA PRINCIPAL E MENSAGEM FINAL">
      <style>{`
        html body #homeExtraSection{
          position:relative!important;
          z-index:110!important;
          width:min(100vw,864px)!important;
          margin:max(-109px,-12.6vw) auto 0!important;
          padding:0 5.21% 34px!important;
          background:transparent!important;
          border:0!important;
          border-radius:0!important;
          box-shadow:none!important;
          outline:0!important;
          overflow:visible!important;
          font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
          box-sizing:border-box!important;
        }
        html body #homeLanguageCard{
          width:100%!important;
          height:min(19.45vw,168px)!important;
          min-height:0!important;
          display:grid!important;
          grid-template-columns:min(18vw,132px) minmax(0,1fr) 28px!important;
          align-items:center!important;
          gap:min(3vw,22px)!important;
          padding:min(1.1vw,8px) min(3.2vw,24px)!important;
          margin:0!important;
          border:3px solid #148fe3!important;
          border-radius:min(4vw,24px)!important;
          background:#f7fbff!important;
          box-shadow:0 0 0 1px rgba(104,205,255,.20),0 4px 10px rgba(0,0,0,.22)!important;
          color:#08134c!important;
          box-sizing:border-box!important;
        }
        html body #homeLanguageIcon{
          width:min(17vw,122px)!important;
          height:min(15vw,108px)!important;
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          border:2px solid #1c91df!important;
          border-radius:min(2.9vw,18px)!important;
          background:#06254a!important;
          box-shadow:inset 0 0 12px rgba(29,163,255,.16)!important;
          color:#dff6ff!important;
          box-sizing:border-box!important;
        }
        html body #homeLanguageIcon svg{
          width:min(8vw,58px)!important;
          height:min(8vw,58px)!important;
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
          gap:min(1.1vw,8px)!important;
        }
        html body #homeLanguageTitle{
          margin:0!important;
          padding:0!important;
          font-size:min(4.28vw,37px)!important;
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
          font-size:min(3.01vw,26px)!important;
          line-height:1.18!important;
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
          font-size:min(6vw,44px)!important;
          line-height:1!important;
          color:#108ee1!important;
          -webkit-text-fill-color:#108ee1!important;
          text-shadow:0 0 4px rgba(16,142,225,.22)!important;
        }
        html body #homeMotto{
          width:100%!important;
          margin:min(3.2vw,24px) 0 0!important;
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
          text-shadow:0 2px 2px rgba(0,10,35,.90),0 0 5px rgba(32,184,255,.70)!important;
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
