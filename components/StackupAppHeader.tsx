import Link from "next/link";

const HEROES_LOGO_SRC = "/gemeo.stackup.holdem-heroes/stackup-heroes-logo-128-valid-20260911.png";

export default function StackupAppHeader(){
  return <>
    <style>{`
      html body main.module-page{
        min-height:100vh!important;
        background:#031a31!important;
        background-image:none!important;
      }

      html body main.module-page .stackup-app-header{
        position:relative!important;
        isolation:isolate!important;
        overflow:hidden!important;
        width:100%!important;
        min-height:174px!important;
        margin:0 0 22px!important;
        padding:18px 28px!important;
        border:0!important;
        border-bottom:2px solid #23b8ff!important;
        background:#031a31!important;
        background-image:
          radial-gradient(circle at 16% 18%,rgba(35,184,255,.22),transparent 30%),
          linear-gradient(115deg,#073866 0%,#031a31 54%,#062c53 100%)!important;
        box-shadow:0 8px 22px rgba(0,0,0,.30)!important;
        font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
      }

      html body main.module-page .stackup-brand-lockup{
        position:relative!important;
        z-index:4!important;
        display:flex!important;
        align-items:center!important;
        gap:18px!important;
        width:min(76%,620px)!important;
        max-width:76%!important;
        min-width:0!important;
        padding:0!important;
        margin:0!important;
        border:0!important;
        background:transparent!important;
        background-image:none!important;
        box-shadow:none!important;
        text-decoration:none!important;
        font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
      }

      html body main.module-page .stackup-logo{
        flex:0 0 112px!important;
        width:112px!important;
        height:112px!important;
        display:grid!important;
        place-items:center!important;
        overflow:visible!important;
        border:0!important;
        border-radius:50%!important;
        background:transparent!important;
        background-image:none!important;
        box-shadow:none!important;
      }

      html body main.module-page .stackup-logo-image{
        display:block!important;
        width:112px!important;
        height:112px!important;
        object-fit:contain!important;
        filter:drop-shadow(0 6px 9px rgba(0,0,0,.38)) drop-shadow(0 0 8px rgba(35,184,255,.20))!important;
      }

      html body main.module-page .stackup-brand-copy{
        display:flex!important;
        flex-direction:column!important;
        align-items:flex-start!important;
        justify-content:center!important;
        gap:0!important;
        min-width:0!important;
        margin:0!important;
        padding:0!important;
        background:transparent!important;
      }

      html body main.module-page .stackup-app-title{
        display:flex!important;
        flex-direction:column!important;
        align-items:flex-start!important;
        gap:0!important;
        margin:0!important;
        padding:0!important;
        font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
        font-weight:400!important;
        font-style:normal!important;
        line-height:1!important;
        letter-spacing:0!important;
        text-align:left!important;
        text-transform:uppercase!important;
      }

      html body main.module-page .stackup-app-title .stackup-title-main{
        display:block!important;
        margin:0!important;
        padding:0!important;
        font-size:20px!important;
        line-height:1.05!important;
        font-weight:400!important;
        letter-spacing:0!important;
        white-space:nowrap!important;
        color:#fff!important;
        -webkit-text-fill-color:#fff!important;
        text-shadow:0 1px 2px rgba(0,0,0,.32)!important;
      }

      html body main.module-page .stackup-app-title .stackup-title-heroes{
        display:block!important;
        margin:2px 0 0!important;
        padding:0!important;
        font-size:26px!important;
        line-height:1!important;
        font-weight:400!important;
        letter-spacing:0!important;
        white-space:nowrap!important;
        color:#23b8ff!important;
        -webkit-text-fill-color:#23b8ff!important;
        text-shadow:0 2px 2px rgba(0,10,35,.90),0 0 5px rgba(35,184,255,.70)!important;
      }

      html body main.module-page .stackup-app-subtitle{
        display:block!important;
        margin:13px 0 0!important;
        padding:0!important;
        font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
        font-size:12px!important;
        line-height:1.05!important;
        font-weight:400!important;
        letter-spacing:.08em!important;
        white-space:nowrap!important;
        color:#fff!important;
        -webkit-text-fill-color:#fff!important;
        text-shadow:0 1px 2px rgba(0,0,0,.32)!important;
      }

      html body main.module-page .stackup-header-deck{
        position:absolute!important;
        z-index:1!important;
        right:18px!important;
        top:12px!important;
        width:130px!important;
        height:150px!important;
        pointer-events:none!important;
        opacity:.72!important;
        background:transparent!important;
      }

      html body main.module-page .stackup-header-card{
        position:absolute!important;
        display:flex!important;
        align-items:flex-start!important;
        justify-content:flex-start!important;
        width:82px!important;
        height:124px!important;
        padding:10px!important;
        border:1px solid rgba(54,161,243,.54)!important;
        border-radius:12px!important;
        background:linear-gradient(155deg,#0d5a9d 0%,#073866 52%,#031a31 100%)!important;
        box-shadow:0 8px 18px rgba(0,0,0,.30)!important;
        font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
        font-size:18px!important;
        font-weight:400!important;
        line-height:1!important;
        color:#041225!important;
        -webkit-text-fill-color:#041225!important;
      }

      html body main.module-page .stackup-header-card::after{
        content:"♠"!important;
        position:absolute!important;
        right:10px!important;
        bottom:12px!important;
        font-size:40px!important;
        line-height:1!important;
        color:rgba(0,10,28,.78)!important;
        -webkit-text-fill-color:rgba(0,10,28,.78)!important;
      }

      html body main.module-page .stackup-header-card-back{
        right:42px!important;
        top:20px!important;
        transform:rotate(-13deg)!important;
      }

      html body main.module-page .stackup-header-card-front{
        right:0!important;
        top:0!important;
        transform:rotate(-9deg)!important;
      }

      @media(max-width:560px){
        html body main.module-page .stackup-app-header{
          min-height:132px!important;
          padding:12px 14px!important;
          margin-bottom:16px!important;
        }
        html body main.module-page .stackup-brand-lockup{
          gap:10px!important;
          width:82%!important;
          max-width:82%!important;
        }
        html body main.module-page .stackup-logo,
        html body main.module-page .stackup-logo-image{
          flex-basis:76px!important;
          width:76px!important;
          height:76px!important;
        }
        html body main.module-page .stackup-app-title .stackup-title-main{font-size:20px!important}
        html body main.module-page .stackup-app-title .stackup-title-heroes{font-size:26px!important}
        html body main.module-page .stackup-app-subtitle{font-size:12px!important;margin-top:8px!important;letter-spacing:.035em!important}
        html body main.module-page .stackup-header-deck{right:6px!important;top:9px!important;width:82px!important;height:112px!important;opacity:.60!important}
        html body main.module-page .stackup-header-card{width:56px!important;height:88px!important;padding:7px!important;border-radius:9px!important;font-size:14px!important}
        html body main.module-page .stackup-header-card::after{right:7px!important;bottom:8px!important;font-size:27px!important}
        html body main.module-page .stackup-header-card-back{right:24px!important;top:16px!important}
      }
    `}</style>
    <header className="stackup-app-header" aria-label="STACKUP HOLD'EM HEROES">
      <Link className="stackup-brand-lockup" href="/" aria-label="STACKUP HOLD'EM HEROES — INÍCIO">
        <span className="stackup-logo" aria-hidden="true">
          <img className="stackup-logo-image" src={HEROES_LOGO_SRC} alt="" width="128" height="128" />
        </span>
        <span className="stackup-brand-copy">
          <strong className="stackup-app-title">
            <span className="stackup-title-main">STACKUP HOLD&apos;EM</span>
            <span className="stackup-title-heroes">HEROES</span>
          </strong>
          <span className="stackup-app-subtitle">AI POKER PERFORMANCE SYSTEM</span>
        </span>
      </Link>
      <span className="stackup-header-deck" aria-hidden="true">
        <span className="stackup-header-card stackup-header-card-back">A♠</span>
        <span className="stackup-header-card stackup-header-card-front">A♠</span>
      </span>
    </header>
  </>;
}
