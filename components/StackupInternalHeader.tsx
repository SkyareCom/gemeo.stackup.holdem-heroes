import StackupAppHeader from "@/components/StackupAppHeader";

const FINAL_INTERNAL_STYLE=`
html body #stackup-internal-root{
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
html body #stackup-internal-root>.internal-header-host{
  position:relative!important;
  z-index:20!important;
  width:100%!important;
  margin:0!important;
  padding:0!important;
  background:#031a31!important;
  border:0!important;
}
html body #stackup-internal-root .stackup-internal-brand-header{
  position:relative!important;
  width:100%!important;
  height:168px!important;
  margin:0!important;
  padding:0!important;
  overflow:hidden!important;
  border:0!important;
  border-bottom:1px solid rgba(35,184,255,.72)!important;
  border-radius:0!important;
  background:#031a31!important;
  box-shadow:none!important;
}
html body #stackup-internal-root .stackup-internal-brand-header::before,
html body #stackup-internal-root .stackup-internal-brand-header::after{
  content:""!important;
  position:absolute!important;
  right:20px!important;
  width:52px!important;
  height:76px!important;
  border:1px solid rgba(255,255,255,.055)!important;
  border-radius:8px!important;
  background:transparent!important;
  pointer-events:none!important;
}
html body #stackup-internal-root .stackup-internal-brand-header::before{top:18px!important;transform:rotate(-12deg)!important}
html body #stackup-internal-root .stackup-internal-brand-header::after{top:44px!important;right:58px!important;transform:rotate(8deg)!important}
html body #stackup-internal-root .stackup-internal-brand-link{
  position:relative!important;
  z-index:2!important;
  display:grid!important;
  grid-template-columns:128px minmax(0,1fr)!important;
  align-items:center!important;
  gap:18px!important;
  width:min(100%,864px)!important;
  height:100%!important;
  margin:0 auto!important;
  padding:18px 24px!important;
  box-sizing:border-box!important;
  background:transparent!important;
  border:0!important;
  text-decoration:none!important;
  font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
}
html body #stackup-internal-root .stackup-internal-logo-wrap{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:128px!important;
  height:128px!important;
  margin:0!important;
  padding:0!important;
  background:transparent!important;
  border:0!important;
}
html body #stackup-internal-root .stackup-internal-logo{
  display:block!important;
  width:118px!important;
  height:118px!important;
  object-fit:contain!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  background:transparent!important;
}
html body #stackup-internal-root .stackup-internal-brand-copy{
  position:relative!important;
  z-index:2!important;
  display:flex!important;
  flex-direction:column!important;
  align-items:flex-start!important;
  justify-content:center!important;
  min-width:0!important;
  height:100%!important;
  margin:0!important;
  padding:0!important;
  background:transparent!important;
  border:0!important;
  font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
}
html body #stackup-internal-root .stackup-internal-brand-name{
  display:block!important;
  margin:0!important;
  padding:0!important;
  font:400 28px/1.02 var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
  letter-spacing:.01em!important;
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  white-space:nowrap!important;
}
html body #stackup-internal-root .stackup-internal-brand-heroes{
  display:block!important;
  margin:3px 0 0!important;
  padding:0!important;
  font:400 26px/.98 var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
  color:#23b8ff!important;
  -webkit-text-fill-color:#23b8ff!important;
  white-space:nowrap!important;
  text-shadow:0 1px 2px rgba(0,0,0,.6)!important;
}
html body #stackup-internal-root .stackup-internal-brand-subtitle{
  display:block!important;
  margin:18px 0 0!important;
  padding:0!important;
  font:400 17px/1.08 var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
  letter-spacing:.015em!important;
  color:#e7edf7!important;
  -webkit-text-fill-color:#e7edf7!important;
  white-space:nowrap!important;
}
html body #stackup-internal-root>.module-screen-title{
  display:block!important;
  width:auto!important;
  margin:16px 24px 14px!important;
  padding:0!important;
  background:transparent!important;
  border:0!important;
  font:400 24px/1.1 var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
  color:#23b8ff!important;
  -webkit-text-fill-color:#23b8ff!important;
  text-shadow:none!important;
}
html body #stackup-internal-root main.module-page{
  position:relative!important;
  z-index:2!important;
  width:100%!important;
  max-width:864px!important;
  min-height:0!important;
  margin:0 auto!important;
  padding:0 24px 42px!important;
  box-sizing:border-box!important;
  overflow:visible!important;
  background:#031a31!important;
  background-color:#031a31!important;
  background-image:none!important;
  color:#fff!important;
  font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
}
html body #stackup-internal-root main.module-page nav.module-navigation{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:12px!important;
  width:100%!important;
  margin:0 0 18px!important;
  padding:0!important;
  background:transparent!important;
  border:0!important;
}
html body #stackup-internal-root main.module-page nav.module-navigation>a,
html body #stackup-internal-root main.module-page nav.module-navigation>button,
html body #stackup-internal-root main.module-page nav.module-navigation>.player-dna-nav-button{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:100%!important;
  min-width:0!important;
  height:54px!important;
  min-height:54px!important;
  max-height:54px!important;
  margin:0!important;
  padding:8px 10px!important;
  box-sizing:border-box!important;
  border:2px solid #23b8ff!important;
  border-radius:16px!important;
  background:#f8fbff!important;
  background-color:#f8fbff!important;
  background-image:linear-gradient(180deg,#ffffff 0%,#f8fcff 56%,#eef8ff 100%)!important;
  color:#08134c!important;
  -webkit-text-fill-color:#08134c!important;
  box-shadow:0 2px 6px rgba(0,0,0,.16)!important;
  font:400 15px/1 var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
  text-decoration:none!important;
  text-align:center!important;
  white-space:nowrap!important;
}
html body #stackup-internal-root main.module-page section.panel,
html body #stackup-internal-root main.player-dna-page section.profile-panel,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel{
  width:100%!important;
  margin:0!important;
  padding:18px!important;
  box-sizing:border-box!important;
  border:2px solid #23b8ff!important;
  border-radius:20px!important;
  background:#f8fbff!important;
  background-color:#f8fbff!important;
  background-image:linear-gradient(180deg,#ffffff 0%,#f8fcff 62%,#eef8ff 100%)!important;
  color:#08134c!important;
  box-shadow:0 3px 10px rgba(0,0,0,.14)!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
html body #stackup-internal-root main.module-page section.panel h1,
html body #stackup-internal-root main.module-page section.panel h2,
html body #stackup-internal-root main.module-page section.panel h3,
html body #stackup-internal-root main.module-page section.panel h4,
html body #stackup-internal-root main.module-page section.panel .eyebrow,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel h1,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel h2,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel h3,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel h4,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel .eyebrow{
  font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
  color:#23b8ff!important;
  -webkit-text-fill-color:#23b8ff!important;
  text-shadow:none!important;
}
html body #stackup-internal-root main.module-page section.panel p,
html body #stackup-internal-root main.module-page section.panel label,
html body #stackup-internal-root main.module-page section.panel small,
html body #stackup-internal-root main.module-page section.panel b,
html body #stackup-internal-root main.module-page section.panel strong,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel p,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel label,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel small,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel b,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel strong{
  font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
  color:#08134c!important;
  -webkit-text-fill-color:#08134c!important;
}
html body #stackup-internal-root main.module-page section.panel button:not(.primary),
html body #stackup-internal-root main.module-page section.panel input,
html body #stackup-internal-root main.module-page section.panel textarea,
html body #stackup-internal-root main.module-page section.panel select,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel button:not(.primary),
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel input,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel textarea,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel select{
  border:1.5px solid #23b8ff!important;
  background:#fff!important;
  background-color:#fff!important;
  background-image:none!important;
  color:#08134c!important;
  -webkit-text-fill-color:#08134c!important;
  box-shadow:none!important;
  font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
}
html body #stackup-internal-root main.module-page section.panel button.primary,
html body #stackup-internal-root main.module-page section.panel button[aria-pressed="true"],
html body #stackup-internal-root main.module-page section.panel button[aria-selected="true"],
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel button.primary,
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel button[aria-pressed="true"],
html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel button[aria-selected="true"]{
  border:2px solid #fff!important;
  background:#168ee8!important;
  background-color:#168ee8!important;
  background-image:none!important;
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  box-shadow:0 0 0 2px #23b8ff!important;
}
html body #stackup-internal-root.player-dna-screen-shell .mode-choices>label,
html body #stackup-internal-root.player-dna-screen-shell .depth-choices>button,
html body #stackup-internal-root.player-dna-screen-shell .saved-analysis-panel,
html body #stackup-internal-root.player-dna-screen-shell .history-panel,
html body #stackup-internal-root.player-dna-screen-shell .player-comment-card{
  border-color:#23b8ff!important;
  background:#fff!important;
  background-color:#fff!important;
  background-image:none!important;
  color:#08134c!important;
  -webkit-text-fill-color:#08134c!important;
  box-shadow:none!important;
}
html body #stackup-internal-root.player-dna-screen-shell .mode-choices>label>strong,
html body #stackup-internal-root.player-dna-screen-shell .depth-choices>button strong,
html body #stackup-internal-root.player-dna-screen-shell .depth-choices>button span,
html body #stackup-internal-root.player-dna-screen-shell .saved-analysis-panel *,
html body #stackup-internal-root.player-dna-screen-shell .history-panel *,
html body #stackup-internal-root.player-dna-screen-shell .player-comment-card *{
  color:#08134c!important;
  -webkit-text-fill-color:#08134c!important;
}
html body #stackup-internal-root.player-dna-screen-shell .mode-choices>label:has(input:checked){
  border:2px solid #fff!important;
  background:#168ee8!important;
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
  box-shadow:0 0 0 2px #23b8ff!important;
}
html body #stackup-internal-root.player-dna-screen-shell .mode-choices>label:has(input:checked)>strong,
html body #stackup-internal-root.player-dna-screen-shell .depth-choices>button[aria-pressed="true"] strong,
html body #stackup-internal-root.player-dna-screen-shell .depth-choices>button[aria-pressed="true"] span{
  color:#fff!important;
  -webkit-text-fill-color:#fff!important;
}
html body #stackup-internal-root.math-screen-shell main.module-page section.panel>div>div:first-child>div:last-child{
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:8px!important;
  width:100%!important;
}
html body #stackup-internal-root.math-screen-shell main.module-page section.panel>div>div:first-child>div:last-child>button{
  width:100%!important;
  min-width:0!important;
}
html body #stackup-internal-root.hand-review-screen-shell main.ai-hand-review-page section.hand-review-panel>div,
html body #stackup-internal-root.hand-review-screen-shell main.ai-hand-review-page section.hand-review-panel section,
html body #stackup-internal-root.hand-review-screen-shell main.ai-hand-review-page section.hand-review-panel header,
html body #stackup-internal-root.math-screen-shell main.module-page section.panel article,
html body #stackup-internal-root.math-screen-shell main.module-page section.panel aside,
html body #stackup-internal-root.math-screen-shell main.module-page section.panel section{
  background:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
@media(max-width:560px){
  html body #stackup-internal-root .stackup-internal-brand-header{height:154px!important}
  html body #stackup-internal-root .stackup-internal-brand-link{grid-template-columns:108px minmax(0,1fr)!important;gap:14px!important;padding:14px 18px!important}
  html body #stackup-internal-root .stackup-internal-logo-wrap{width:108px!important;height:108px!important}
  html body #stackup-internal-root .stackup-internal-logo{width:104px!important;height:104px!important}
  html body #stackup-internal-root .stackup-internal-brand-name{font-size:25px!important}
  html body #stackup-internal-root .stackup-internal-brand-heroes{font-size:24px!important}
  html body #stackup-internal-root .stackup-internal-brand-subtitle{font-size:15px!important;margin-top:15px!important}
  html body #stackup-internal-root>.module-screen-title{margin:14px 18px 12px!important;font-size:22px!important}
  html body #stackup-internal-root main.module-page{padding:0 18px 36px!important}
  html body #stackup-internal-root main.module-page nav.module-navigation{gap:10px!important;margin-bottom:16px!important}
  html body #stackup-internal-root main.module-page nav.module-navigation>a,
  html body #stackup-internal-root main.module-page nav.module-navigation>button,
  html body #stackup-internal-root main.module-page nav.module-navigation>.player-dna-nav-button{height:52px!important;min-height:52px!important;max-height:52px!important;font-size:14px!important}
  html body #stackup-internal-root main.module-page section.panel,
  html body #stackup-internal-root main.ai-hand-review-page section.hand-review-panel{padding:15px!important;border-radius:18px!important}
}
`;

export default function StackupInternalHeader(){
  return <div className="internal-header-host"><StackupAppHeader/><style>{FINAL_INTERNAL_STYLE}</style></div>;
}
