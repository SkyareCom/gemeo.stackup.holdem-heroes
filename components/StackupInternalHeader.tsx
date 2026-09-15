import StackupAppHeader from "@/components/StackupAppHeader";

const ROOT="#stackup-internal-root:not(#stackup-hard-a):not(#stackup-hard-b):not(#stackup-hard-c):not(#stackup-hard-d):not(#stackup-hard-e):not(#stackup-hard-f):not(#stackup-hard-g):not(#stackup-hard-h)";

const FINAL_INTERNAL_STYLE=`
html body ${ROOT}{
  position:relative!important;
  width:100%!important;
  min-height:100vh!important;
  margin:0!important;
  padding:0 0 42px!important;
  overflow-x:hidden!important;
  background:#031a31!important;
  background-color:#031a31!important;
  background-image:none!important;
  color:#fff!important;
  font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
}
html body ${ROOT}>.internal-header-host{
  position:relative!important;
  z-index:20!important;
  width:100%!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  background:#031a31!important;
  border:0!important;
}
html body ${ROOT} .stackup-internal-brand-header{
  position:relative!important;
  width:min(100%,864px)!important;
  height:min(27vw,190px)!important;
  min-height:96px!important;
  max-height:190px!important;
  margin:0 auto!important;
  padding:0!important;
  overflow:hidden!important;
  border:0!important;
  border-bottom:1px solid rgba(35,184,255,.72)!important;
  border-radius:0!important;
  background:#031a31!important;
  box-shadow:none!important;
}
html body ${ROOT} .stackup-internal-brand-link{
  position:absolute!important;
  inset:0!important;
  z-index:2!important;
  display:block!important;
  width:100%!important;
  height:100%!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  text-decoration:none!important;
  overflow:hidden!important;
}
html body ${ROOT} .stackup-internal-header-art{
  position:absolute!important;
  z-index:0!important;
  top:0!important;
  left:0!important;
  display:block!important;
  width:100%!important;
  height:auto!important;
  max-width:none!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  object-fit:contain!important;
  pointer-events:none!important;
}
html body ${ROOT} .stackup-internal-brand-copy{
  position:absolute!important;
  z-index:3!important;
  inset:0!important;
  display:block!important;
  width:100%!important;
  height:100%!important;
  margin:0!important;
  padding:0!important;
  background:transparent!important;
  border:0!important;
  font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
}
html body ${ROOT} .stackup-internal-brand-name,
html body ${ROOT} .stackup-internal-brand-heroes,
html body ${ROOT} .stackup-internal-brand-subtitle{
  position:absolute!important;
  display:block!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
  font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
  font-weight:400!important;
  font-style:normal!important;
  text-align:left!important;
  white-space:nowrap!important;
}
html body ${ROOT} .stackup-internal-brand-name{
  left:30.7%!important;
  top:17.5%!important;
  font-size:min(6.2vw,34px)!important;
  line-height:1.02!important;
  letter-spacing:.01em!important;
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  text-shadow:0 1px 2px rgba(0,0,0,.42)!important;
}
html body ${ROOT} .stackup-internal-brand-heroes{
  left:30.7%!important;
  top:39%!important;
  font-size:min(5.8vw,30px)!important;
  line-height:1!important;
  color:#23b8ff!important;
  -webkit-text-fill-color:#23b8ff!important;
  text-shadow:0 1px 2px rgba(0,10,35,.9),0 0 4px rgba(35,184,255,.55)!important;
}
html body ${ROOT} .stackup-internal-brand-subtitle{
  left:30.7%!important;
  top:75%!important;
  font-size:min(3.2vw,16px)!important;
  line-height:1.05!important;
  letter-spacing:.015em!important;
  color:#f3f6fb!important;
  -webkit-text-fill-color:#f3f6fb!important;
  text-shadow:0 1px 2px rgba(0,0,0,.52)!important;
}
html body ${ROOT}>.module-screen-title{
  position:relative!important;
  z-index:4!important;
  display:block!important;
  width:min(calc(100% - 36px),828px)!important;
  margin:14px auto 12px!important;
  padding:0!important;
  background:transparent!important;
  border:0!important;
  font:400 22px/1.12 var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
  letter-spacing:.02em!important;
  text-align:left!important;
  color:#23b8ff!important;
  -webkit-text-fill-color:#23b8ff!important;
  text-shadow:none!important;
}
html body ${ROOT}::before,
html body ${ROOT}::after{
  content:""!important;
  position:absolute!important;
  z-index:0!important;
  top:225px!important;
  right:24px!important;
  width:50px!important;
  height:72px!important;
  border:1px solid rgba(255,255,255,.055)!important;
  border-radius:8px!important;
  background:transparent!important;
  box-shadow:none!important;
  pointer-events:none!important;
}
html body ${ROOT}::before{transform:rotate(-11deg)!important}
html body ${ROOT}::after{top:246px!important;right:62px!important;transform:rotate(8deg)!important}
html body ${ROOT} main.module-page{
  position:relative!important;
  z-index:2!important;
  width:100%!important;
  max-width:864px!important;
  min-height:0!important;
  margin:0 auto!important;
  padding:0 18px 42px!important;
  box-sizing:border-box!important;
  overflow:visible!important;
  background:#031a31!important;
  background-color:#031a31!important;
  background-image:none!important;
  color:#fff!important;
  font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
}
html body ${ROOT} main.module-page::before,
html body ${ROOT} main.module-page::after{
  display:none!important;
  content:none!important;
}
html body ${ROOT} main.module-page nav.module-navigation,
html body ${ROOT} main.player-dna-page nav.module-navigation.player-dna-navigation{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:10px!important;
  width:100%!important;
  min-width:0!important;
  max-width:100%!important;
  margin:0 0 18px!important;
  padding:0!important;
  background:transparent!important;
  border:0!important;
  box-shadow:none!important;
}
html body ${ROOT} main.module-page nav.module-navigation>a,
html body ${ROOT} main.module-page nav.module-navigation>button,
html body ${ROOT} main.module-page nav.module-navigation>.player-dna-nav-button,
html body ${ROOT} main.player-dna-page nav.module-navigation.player-dna-navigation>a{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:100%!important;
  min-width:0!important;
  max-width:100%!important;
  height:52px!important;
  min-height:52px!important;
  max-height:52px!important;
  margin:0!important;
  padding:8px 8px!important;
  box-sizing:border-box!important;
  border:2px solid #23b8ff!important;
  border-radius:15px!important;
  background:#f8fbff!important;
  background-color:#f8fbff!important;
  background-image:linear-gradient(180deg,#fff 0%,#f8fcff 56%,#eef8ff 100%)!important;
  color:#08134c!important;
  -webkit-text-fill-color:#08134c!important;
  box-shadow:0 2px 6px rgba(0,0,0,.14)!important;
  font:400 14px/1 var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
  letter-spacing:0!important;
  text-decoration:none!important;
  text-align:center!important;
  white-space:nowrap!important;
}
html body ${ROOT} main.module-page section.panel,
html body ${ROOT} main.player-dna-page section.panel.profile-panel,
html body ${ROOT} main.ai-hand-review-page section.panel.hand-review-panel{
  display:block!important;
  width:100%!important;
  min-width:0!important;
  max-width:100%!important;
  margin:0!important;
  padding:16px!important;
  box-sizing:border-box!important;
  border:2px solid #23b8ff!important;
  border-radius:18px!important;
  background:#f8fbff!important;
  background-color:#f8fbff!important;
  background-image:linear-gradient(180deg,#fff 0%,#f8fcff 60%,#eef8ff 100%)!important;
  color:#08134c!important;
  -webkit-text-fill-color:#08134c!important;
  box-shadow:0 3px 10px rgba(0,0,0,.14)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
html body ${ROOT} main.module-page section.panel div[class],
html body ${ROOT} main.module-page section.panel section[class],
html body ${ROOT} main.module-page section.panel article[class],
html body ${ROOT} main.module-page section.panel aside[class],
html body ${ROOT} main.module-page section.panel header[class]{
  background-color:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
html body ${ROOT} main.module-page section.panel *,
html body ${ROOT} main.ai-hand-review-page section.hand-review-panel *{
  font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
  color:#08134c!important;
  -webkit-text-fill-color:#08134c!important;
  text-shadow:none!important;
}
html body ${ROOT} main.module-page section.panel h1,
html body ${ROOT} main.module-page section.panel h2,
html body ${ROOT} main.module-page section.panel h3,
html body ${ROOT} main.module-page section.panel h4,
html body ${ROOT} main.module-page section.panel .eyebrow,
html body ${ROOT} main.module-page section.panel [class*=eyebrow],
html body ${ROOT} main.ai-hand-review-page section.hand-review-panel h1,
html body ${ROOT} main.ai-hand-review-page section.hand-review-panel h2,
html body ${ROOT} main.ai-hand-review-page section.hand-review-panel h3,
html body ${ROOT} main.ai-hand-review-page section.hand-review-panel h4{
  color:#168ee8!important;
  -webkit-text-fill-color:#168ee8!important;
}
html body ${ROOT} main.module-page section.panel button,
html body ${ROOT} main.module-page section.panel input,
html body ${ROOT} main.module-page section.panel textarea,
html body ${ROOT} main.module-page section.panel select,
html body ${ROOT} main.module-page section.panel label:has(input),
html body ${ROOT} main.ai-hand-review-page section.hand-review-panel button,
html body ${ROOT} main.ai-hand-review-page section.hand-review-panel input,
html body ${ROOT} main.ai-hand-review-page section.hand-review-panel textarea,
html body ${ROOT} main.ai-hand-review-page section.hand-review-panel select{
  box-sizing:border-box!important;
  border:1.5px solid #23b8ff!important;
  background:#fff!important;
  background-color:#fff!important;
  background-image:none!important;
  color:#08134c!important;
  -webkit-text-fill-color:#08134c!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
html body ${ROOT} main.module-page section.panel button[aria-pressed="true"],
html body ${ROOT} main.module-page section.panel button[aria-selected="true"],
html body ${ROOT} main.module-page section.panel button.active,
html body ${ROOT} main.module-page section.panel button[class*=active],
html body ${ROOT} main.module-page section.panel label:has(input:checked),
html body ${ROOT} main.ai-hand-review-page section.hand-review-panel button[aria-pressed="true"],
html body ${ROOT} main.ai-hand-review-page section.hand-review-panel button[aria-selected="true"]{
  border:2px solid #fff!important;
  background:#168ee8!important;
  background-color:#168ee8!important;
  background-image:none!important;
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  box-shadow:0 0 0 2px #23b8ff!important;
}
html body ${ROOT} main.module-page section.panel button[aria-pressed="true"] *,
html body ${ROOT} main.module-page section.panel button[aria-selected="true"] *,
html body ${ROOT} main.module-page section.panel button.active *,
html body ${ROOT} main.module-page section.panel button[class*=active] *,
html body ${ROOT} main.module-page section.panel label:has(input:checked) *{
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
}
html body ${ROOT}.player-dna-screen-shell main.player-dna-page section.profile-panel{
  border:2px solid #23b8ff!important;
  border-radius:18px!important;
  padding:16px!important;
  background:#f8fbff!important;
  background-color:#f8fbff!important;
  background-image:linear-gradient(180deg,#fff 0%,#f8fcff 60%,#eef8ff 100%)!important;
  box-shadow:0 3px 10px rgba(0,0,0,.14)!important;
}
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .mode-choices>label,
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .depth-choices>button,
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .saved-analysis-panel,
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .history-panel,
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .player-comment-card{
  border:1.5px solid #23b8ff!important;
  border-radius:14px!important;
  background:#fff!important;
  background-color:#fff!important;
  background-image:none!important;
  color:#08134c!important;
  -webkit-text-fill-color:#08134c!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .mode-choices>label *,
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .depth-choices>button *,
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .saved-analysis-panel *,
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .history-panel *,
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .player-comment-card *{
  color:#08134c!important;
  -webkit-text-fill-color:#08134c!important;
}
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .mode-choices>label:has(input:checked),
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .depth-choices>button[aria-pressed="true"]{
  border:2px solid #fff!important;
  background:#168ee8!important;
  background-color:#168ee8!important;
  background-image:none!important;
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  box-shadow:0 0 0 2px #23b8ff!important;
}
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .mode-choices>label:has(input:checked) *,
html body ${ROOT}.player-dna-screen-shell main.player-dna-page .depth-choices>button[aria-pressed="true"] *{
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
}
html body ${ROOT}.math-screen-shell main.module-page section.panel [class*=tabs]{
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:8px!important;
  width:100%!important;
}
html body ${ROOT}.math-screen-shell main.module-page section.panel [class*=tabs]>button{
  width:100%!important;
  min-width:0!important;
  max-width:100%!important;
  min-height:46px!important;
  margin:0!important;
  padding:8px 4px!important;
}
html body ${ROOT}.math-screen-shell main.module-page section.panel [class*=conceptLayout],
html body ${ROOT}.math-screen-shell main.module-page section.panel [class*=practice],
html body ${ROOT}.math-screen-shell main.module-page section.panel [class*=doubts]{
  grid-template-columns:1fr!important;
  width:100%!important;
  min-width:0!important;
}
html body ${ROOT}.assistant-screen-shell main.module-page section.panel [class*=composer],
html body ${ROOT}.assistant-screen-shell main.module-page section.panel [class*=answer],
html body ${ROOT}.assistant-screen-shell main.module-page section.panel [class*=usage],
html body ${ROOT}.assistant-screen-shell main.module-page section.panel [class*=preview],
html body ${ROOT}.assistant-screen-shell main.module-page section.panel [class*=error],
html body ${ROOT}.hand-review-screen-shell main.ai-hand-review-page section.hand-review-panel [class*=step],
html body ${ROOT}.hand-review-screen-shell main.ai-hand-review-page section.hand-review-panel [class*=section],
html body ${ROOT}.hand-review-screen-shell main.ai-hand-review-page section.hand-review-panel [class*=moneyField],
html body ${ROOT}.hand-review-screen-shell main.ai-hand-review-page section.hand-review-panel [class*=analysisCard],
html body ${ROOT}.hand-review-screen-shell main.ai-hand-review-page section.hand-review-panel [class*=metric],
html body ${ROOT}.hand-review-screen-shell main.ai-hand-review-page section.hand-review-panel [class*=verdict]{
  background:#fff!important;
  background-color:#fff!important;
  background-image:none!important;
  border-color:rgba(35,184,255,.42)!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
@media(max-width:520px){
  html body ${ROOT} .stackup-internal-brand-header{height:27vw!important;min-height:96px!important}
  html body ${ROOT} .stackup-internal-brand-name{font-size:5.9vw!important}
  html body ${ROOT} .stackup-internal-brand-heroes{font-size:5.6vw!important}
  html body ${ROOT} .stackup-internal-brand-subtitle{font-size:3vw!important}
  html body ${ROOT}>.module-screen-title{width:calc(100% - 36px)!important;font-size:20px!important}
  html body ${ROOT} main.module-page{padding-left:18px!important;padding-right:18px!important}
  html body ${ROOT} main.module-page section.panel,
  html body ${ROOT} main.ai-hand-review-page section.hand-review-panel{padding:14px!important;border-radius:17px!important}
}
`;

export default function StackupInternalHeader(){
  return <div className="internal-header-host"><StackupAppHeader/><style>{FINAL_INTERNAL_STYLE}</style></div>;
}
