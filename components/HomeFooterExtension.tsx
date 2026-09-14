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
          box-sizing:border-box!important;
          font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
        }

        /* Fifth module follows the same visible envelope as the four artwork cards above. */
        html body #homeLanguageCard{
          position:relative!important;
          width:calc(100% - 6px)!important;
          height:calc(min(19.45vw,168px) - 6px)!important;
          min-height:0!important;
          margin:3px auto 0!important;
          padding:0!important;
          overflow:hidden!important;
          box-sizing:border-box!important;
          border:1px solid #9edfff!important;
          border-radius:min(3.75vw,24px)!important;
          background:linear-gradient(180deg,#ffffff 0%,#f7fbff 54%,#edf7ff 100%)!important;
          box-shadow:0 0 0 1px #18a9f0,0 0 0 3px #073b69,0 2px 4px rgba(0,0,0,.16),inset 0 0 0 1px rgba(255,255,255,.92)!important;
          color:#08134c!important;
        }

        html body #homeLanguageIcon{
          position:absolute!important;
          z-index:5!important;
          left:4.15%!important;
          top:11%!important;
          width:18.05%!important;
          height:78%!important;
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          box-sizing:border-box!important;
          border:1px solid #168bc8!important;
          border-radius:min(2.45vw,15px)!important;
          background:linear-gradient(180deg,#082b54 0%,#061f41 100%)!important;
          box-shadow:inset 0 0 8px rgba(35,184,255,.08)!important;
          color:#e8f8ff!important;
        }
        html body #homeLanguageIcon svg{
          width:48%!important;
          height:48%!important;
          display:block!important;
          fill:none!important;
          stroke:#e8f8ff!important;
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
          font-size:min(4.28vw,37px)!important;
          line-height:1!important;
          font-weight:400!important;
          letter-spacing:.02em!important;
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
          font-size:min(3.01vw,26px)!important;
          line-height:1.18!important;
          font-weight:400!important;
          letter-spacing:.02em!important;
        }

        html body #homeLanguageArrow{
          position:absolute!important;
          z-index:6!important;
          right:4.45%!important;
          top:50%!important;
          transform:translateY(-50%)!important;
          width:min(3.45vw,26px)!important;
          height:min(5.8vw,43px)!important;
          display:flex!important;
          align-items:center!important;
          justify-content:center!important;
          margin:0!important;
          padding:0!important;
          color:#0d8fe2!important;
        }
        html body #homeLanguageArrow svg{
          width:100%!important;
          height:100%!important;
          display:block!important;
          fill:none!important;
          stroke:#0d8fe2!important;
          stroke-width:4.5!important;
          stroke-linecap:round!important;
          stroke-linejoin:round!important;
          filter:none!important;
        }

        html body #homeMotto{
          width:100%!important;
          margin:min(3.1vw,23px) 0 0!important;
          padding:0 0 4px!important;
          display:flex!important;
          align-items:baseline!important;
          justify-content:center!important;
          gap:7px!important;
          white-space:nowrap!important;
          text-align:center!important;
          font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
          font-weight:400!important;
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
        <div id="homeLanguageArrow" aria-hidden="true">
          <svg viewBox="0 0 24 40" focusable="false" aria-hidden="true"><path d="M5 4l12 16L5 36" /></svg>
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
