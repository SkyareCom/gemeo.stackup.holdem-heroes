"use client";

type HomeFooterExtensionProps = {
  backgroundSrc: string;
};

export default function HomeFooterExtension({backgroundSrc}:HomeFooterExtensionProps) {
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
          position:relative!important;
          width:100%!important;
          height:min(19.45vw,168px)!important;
          min-height:0!important;
          margin:0!important;
          padding:0!important;
          border:0!important;
          border-radius:0!important;
          background:transparent!important;
          box-shadow:none!important;
          color:#08134c!important;
          box-sizing:border-box!important;
          overflow:hidden!important;
        }
        html body #homeLanguageCardShell{
          position:absolute!important;
          z-index:0!important;
          width:111.632%!important;
          height:auto!important;
          left:-5.815%!important;
          top:-418.92%!important;
          max-width:none!important;
          margin:0!important;
          padding:0!important;
          border:0!important;
          pointer-events:none!important;
          user-select:none!important;
        }
        html body #homeLanguageIcon{
          position:absolute!important;
          z-index:5!important;
          left:4.0%!important;
          top:12%!important;
          width:17.8%!important;
          height:76%!important;
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          border:0!important;
          border-radius:min(2.5vw,15px)!important;
          background:#06254a!important;
          box-shadow:none!important;
          color:#dff6ff!important;
          box-sizing:border-box!important;
        }
        html body #homeLanguageIcon svg{
          width:56%!important;
          height:56%!important;
          display:block!important;
          fill:none!important;
          stroke:#dff6ff!important;
          stroke-width:2!important;
          stroke-linecap:round!important;
          stroke-linejoin:round!important;
        }
        html body #homeLanguageCard #homeLanguageTitle.cardTitle{
          left:27.1%!important;
          top:12%!important;
          width:66%!important;
          margin:0!important;
          padding:0!important;
          color:#08134c!important;
          -webkit-text-fill-color:#08134c!important;
          white-space:nowrap!important;
          text-align:left!important;
        }
        html body #homeLanguageCard #homeLanguageCopy.cardCopy{
          left:27.4%!important;
          top:44%!important;
          width:68%!important;
          margin:0!important;
          padding:0!important;
          color:#26355e!important;
          -webkit-text-fill-color:#26355e!important;
          text-align:left!important;
          text-transform:none!important;
          white-space:nowrap!important;
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
          text-shadow:0 2px 2px rgba(0,10,35,.90),0 0 5px rgba(35,184,255,.70)!important;
        }
      `}</style>

      <div id="homeLanguageCard">
        {backgroundSrc && <img id="homeLanguageCardShell" src={backgroundSrc} alt="" draggable="false" aria-hidden="true"/>}
        <div id="homeLanguageIcon" aria-hidden="true">
          <svg viewBox="0 0 48 48" focusable="false" aria-hidden="true">
            <circle cx="24" cy="24" r="18" />
            <path d="M6 24h36M24 6c5 5 8 11 8 18s-3 13-8 18M24 6c-5 5-8 11-8 18s3 13 8 18" />
          </svg>
        </div>
        <div id="homeLanguageTitle" className="txt cardTitle">IDIOMA PRINCIPAL</div>
        <div id="homeLanguageCopy" className="txt cardCopy" data-preserve-case="true">
          <span>Escolha o idioma para usar no</span><br/><span>aplicativo</span>
        </div>
      </div>

      <div id="homeMotto" aria-label="ENTENDA. TREINE. EVOLUA.">
        <span id="homeMottoUnderstand">ENTENDA.</span>
        <span id="homeMottoTrain">TREINE.</span>
        <span id="homeMottoEvolve">EVOLUA.</span>
      </div>
    </section>
  );
}
