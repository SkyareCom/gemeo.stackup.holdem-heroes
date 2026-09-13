"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import type {ReactNode} from "react";

const OFFICIAL_LOGO = "/gemeo.stackup.holdem-heroes/stackup-heroes-logo-128-valid-20260911.png";
const POKER_PHOTO = "https://www.riverpokertables.com/cdn/shop/files/modernhospitalityimage.png?v=1767583353&width=1600";

type ModuleItem = {
  href: string;
  title: string;
  description: ReactNode;
  icon: "dna" | "math" | "hands" | "ai";
};

const modules: ModuleItem[] = [
  {
    href: "/player-dna",
    title: "PLAYER DNA",
    description: <><span>Descubra seu perfil técnico</span><br/><span>com spots de treino variados.</span></>,
    icon: "dna",
  },
  {
    href: "/poker-math-lab",
    title: "MATEMÁTICA DO POKER",
    description: <><span>Aprenda odds, pot odds, MDF,</span><br/><span>SPR e conceitos essenciais.</span></>,
    icon: "math",
  },
  {
    href: "/ai-hand-review",
    title: "ANÁLISE DE MÃOS",
    description: <><span>Envie cenários completos e</span><br/><span>receba avaliação estratégica.</span></>,
    icon: "hands",
  },
  {
    href: "/poker-assistant",
    title: "PERGUNTE À IA",
    description: <><span>Tire dúvidas sobre poker,</span><br/><span>estratégia, ranges e decisões.</span></>,
    icon: "ai",
  },
];

function ModuleIcon({kind}:{kind:ModuleItem["icon"]}){
  const common = (
    <defs>
      <linearGradient id={`silver-${kind}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff"/>
        <stop offset="0.5" stopColor="#dcecff"/>
        <stop offset="1" stopColor="#7fcfff"/>
      </linearGradient>
      <linearGradient id={`blue-${kind}`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#008cff"/>
        <stop offset="1" stopColor="#65d7ff"/>
      </linearGradient>
      <filter id={`glow-${kind}`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="1.6" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  );

  if(kind === "dna") return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {common}
      <circle cx="19" cy="17" r="7" fill={`url(#silver-${kind})`} filter={`url(#glow-${kind})`}/>
      <path d="M8 40c1-9 6-14 12-14 5 0 9 3 11 8-2 2-4 4-5 7H8Z" fill={`url(#silver-${kind})`} opacity=".96"/>
      <path d="M43 8c-10 7-10 16 0 23s10 16 0 25M55 8c-10 7-10 16 0 23s10 16 0 25" fill="none" stroke={`url(#blue-${kind})`} strokeWidth="3.6" strokeLinecap="round"/>
      <path d="M45 14h8M42 22h10M43 32h12M45 41h8M43 50h10" stroke="#f8fcff" strokeWidth="2" strokeLinecap="round" opacity=".86"/>
    </svg>
  );

  if(kind === "math") return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {common}
      <path d="M10 51h44" stroke="#dff2ff" strokeWidth="2.4" strokeLinecap="round"/>
      <rect x="12" y="34" width="8" height="17" rx="2" fill={`url(#silver-${kind})`}/>
      <rect x="27" y="25" width="8" height="26" rx="2" fill={`url(#blue-${kind})`}/>
      <rect x="42" y="15" width="8" height="36" rx="2" fill={`url(#silver-${kind})`}/>
      <path d="M12 28 25 21l10 3 17-15" fill="none" stroke="#58caff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter={`url(#glow-${kind})`}/>
      <circle cx="52" cy="9" r="3" fill="#fff"/>
    </svg>
  );

  if(kind === "hands") return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {common}
      <g transform="translate(7 11) rotate(-8 18 22)">
        <rect x="3" y="4" width="27" height="40" rx="4" fill={`url(#silver-${kind})`} stroke="#9edfff" strokeWidth="1.4"/>
        <path d="M9 12h5M9 17h5" stroke="#07163b" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M17 23c-5 4-5 9 0 13 5-4 5-9 0-13Z" fill="#07163b"/>
      </g>
      <g transform="translate(28 8) rotate(10 16 22)">
        <rect x="3" y="4" width="27" height="40" rx="4" fill="#f8fbff" stroke="#1aaeff" strokeWidth="1.5"/>
        <path d="M9 12h5M9 17h5" stroke="#0a1b49" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M17 22c-6 4-6 9 0 14 6-5 6-10 0-14Z" fill={`url(#blue-${kind})`} filter={`url(#glow-${kind})`}/>
      </g>
    </svg>
  );

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {common}
      <rect x="12" y="17" width="40" height="31" rx="10" fill={`url(#silver-${kind})`} stroke="#55caff" strokeWidth="1.8" filter={`url(#glow-${kind})`}/>
      <path d="M32 10v7" stroke="#dff5ff" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="32" cy="8" r="3" fill="#55caff"/>
      <circle cx="24" cy="31" r="4" fill="#07163b"/>
      <circle cx="40" cy="31" r="4" fill="#07163b"/>
      <path d="M24 40c5 4 11 4 16 0" fill="none" stroke="#0a3a68" strokeWidth="2.3" strokeLinecap="round"/>
      <path d="M7 27v12M57 27v12" stroke="#79d7ff" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function HeaderCards(){
  return (
    <div className="hhCards" aria-hidden="true">
      <div className="hhCard hhCardBack"><span className="hhRank">K</span><span className="hhSuit">♠</span></div>
      <div className="hhCard hhCardAce"><span className="hhRank">A</span><span className="hhSuit">♠</span><span className="hhSpade">♠</span><span className="hhRankBottom">A</span></div>
    </div>
  );
}

export default function Home(){
  const router = useRouter();

  const goBack = () => {
    if(typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <div className="heroesHome">
      <style>{`
        html,body{margin:0!important;min-height:100%!important;background:#00152b!important}
        body{overflow-x:hidden!important;-webkit-tap-highlight-color:transparent!important}
        .heroesHome,.heroesHome *{box-sizing:border-box!important}
        .heroesHome{--navy:#00152b;--navy2:#001b38;--navy3:#00234a;--electric:#009dff;--electric2:#18b5ff;--ice:#bdeaff;--text:#07163b;width:100%;min-height:100vh;color:#fff;background:
          radial-gradient(circle at 82% 7%,rgba(0,157,255,.18),transparent 26%),
          radial-gradient(circle at 18% 34%,rgba(24,181,255,.12),transparent 31%),
          linear-gradient(180deg,#00152b 0%,#001a35 36%,#001228 100%);
          font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;overflow:hidden}
        .hhShell{width:min(100%,864px);margin:0 auto;position:relative;background:linear-gradient(180deg,rgba(0,27,56,.64),rgba(0,14,31,.9));box-shadow:0 0 70px rgba(0,157,255,.14);min-height:100vh;overflow:hidden}
        .hhShell:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.22;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);background-size:28px 28px;mask-image:linear-gradient(to bottom,#000 0 38%,transparent 72%)}

        .hhHeader{position:relative;min-height:clamp(150px,25vw,214px);display:grid;grid-template-columns:minmax(86px,20%) 1fr minmax(92px,23%);align-items:center;gap:clamp(8px,2vw,18px);padding:clamp(18px,3.5vw,30px) clamp(18px,4vw,34px);overflow:hidden;border-bottom:1px solid rgba(143,215,255,.26);background:
          radial-gradient(circle at 16% 50%,rgba(24,181,255,.18),transparent 35%),
          linear-gradient(135deg,rgba(0,35,74,.96),rgba(0,16,35,.98) 56%,rgba(0,36,76,.92));
          box-shadow:inset 0 -24px 60px rgba(0,0,0,.2)}
        .hhHeader:after{content:"";position:absolute;right:-8%;top:-42%;width:55%;height:190%;background:linear-gradient(120deg,transparent 24%,rgba(0,157,255,.12) 44%,rgba(255,255,255,.06) 51%,transparent 62%);transform:rotate(-12deg);pointer-events:none}
        .hhLogoWrap{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 10px 20px rgba(0,0,0,.45)) drop-shadow(0 0 12px rgba(0,157,255,.22))}
        .hhLogo{width:clamp(86px,16.5vw,142px);height:auto;display:block;object-fit:contain}
        .hhBrand{position:relative;z-index:3;min-width:0;padding-top:2px;text-shadow:0 2px 9px rgba(0,0,0,.45)}
        .hhBrandTop{font-size:clamp(23px,5.6vw,48px);line-height:.95;white-space:nowrap;letter-spacing:.01em;color:#fff}
        .hhBrandHeroes{font-size:clamp(46px,11.6vw,100px);line-height:.82;margin-top:.05em;color:#18b5ff;text-shadow:0 0 11px rgba(24,181,255,.5),0 2px 0 rgba(189,234,255,.36);white-space:nowrap}
        .hhBrandSub{font-size:clamp(9px,1.85vw,16px);line-height:1.1;margin-top:.7em;letter-spacing:.18em;color:#d8ebf9;white-space:nowrap}

        .hhCards{position:relative;z-index:2;height:clamp(104px,18vw,156px);width:100%;perspective:700px;filter:drop-shadow(0 17px 14px rgba(0,0,0,.42))}
        .hhCard{position:absolute;right:3%;top:2%;width:clamp(66px,12.7vw,110px);aspect-ratio:.69;border-radius:clamp(7px,1.4vw,12px);background:linear-gradient(145deg,#fff 0%,#eaf5ff 58%,#c7e8ff 100%);border:1px solid rgba(255,255,255,.82);box-shadow:inset 0 0 0 1px rgba(0,71,125,.2),inset 0 -16px 24px rgba(0,95,160,.13),0 0 17px rgba(0,157,255,.44),0 18px 26px rgba(0,0,0,.36);color:#06172f;overflow:hidden;transform-origin:50% 100%}
        .hhCard:before{content:"";position:absolute;inset:4px;border-radius:inherit;border:1px solid rgba(0,84,148,.18);box-shadow:inset 0 0 18px rgba(24,181,255,.1)}
        .hhCardAce{transform:rotate(9deg) rotateY(-8deg);z-index:2}
        .hhCardBack{right:24%;top:8%;transform:rotate(-13deg) rotateY(10deg);opacity:.78;z-index:1;background:linear-gradient(145deg,#d7f2ff,#eff9ff 45%,#a9dbfb)}
        .hhRank,.hhRankBottom{position:absolute;left:11%;top:8%;font-size:clamp(17px,3.3vw,29px);line-height:1;color:#06172f}
        .hhRankBottom{left:auto;right:11%;top:auto;bottom:8%;transform:rotate(180deg)}
        .hhSuit{position:absolute;left:12%;top:27%;font-size:clamp(13px,2.6vw,22px);line-height:1}
        .hhSpade{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);font-family:Georgia,serif!important;font-size:clamp(42px,8.7vw,76px);color:#071a33;text-shadow:0 1px 0 #fff,0 0 10px rgba(0,157,255,.35)}

        .hhNav{display:grid;grid-template-columns:1fr 1.15fr;gap:clamp(10px,2.2vw,18px);padding:clamp(14px,2.6vw,22px) clamp(18px,4vw,34px);background:linear-gradient(180deg,rgba(0,13,29,.94),rgba(0,25,51,.88))}
        .hhNavBtn{min-height:clamp(48px,8.2vw,68px);display:flex;align-items:center;justify-content:center;gap:.5em;border-radius:999px;border:1.5px solid #009dff;background:linear-gradient(180deg,rgba(0,35,74,.95),rgba(0,20,45,.98));box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 0 14px rgba(0,157,255,.24),0 8px 18px rgba(0,0,0,.24);color:#fff;text-decoration:none;font:inherit;font-size:clamp(15px,3vw,25px);white-space:nowrap;cursor:pointer;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease,background .16s ease}
        .hhNavBtn:hover{border-color:#62d2ff;box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 20px rgba(0,157,255,.38),0 10px 22px rgba(0,0,0,.27);background:linear-gradient(180deg,rgba(0,52,102,.97),rgba(0,24,54,.98))}
        .hhNavBtn:active{transform:scale(.985)}
        .hhNavBtn:focus-visible{outline:3px solid rgba(189,234,255,.9);outline-offset:3px}
        .hhNavIcon{font-family:Arial,sans-serif!important;font-size:1.15em;line-height:1;font-weight:700}

        .hhHero{position:relative;min-height:clamp(335px,61vw,525px);margin:0 clamp(18px,4vw,34px) clamp(19px,3.4vw,29px);border-radius:clamp(22px,4vw,34px);overflow:hidden;border:1px solid rgba(0,157,255,.42);background:linear-gradient(125deg,#00162e 0%,#001e40 50%,#002b55 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 0 20px rgba(0,157,255,.18),0 18px 42px rgba(0,0,0,.3)}
        .hhHero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 68% 38%,rgba(24,181,255,.28),transparent 30%),linear-gradient(90deg,rgba(0,15,33,.98) 0%,rgba(0,19,40,.9) 47%,rgba(0,25,52,.26) 72%,rgba(0,16,36,.16) 100%);z-index:2;pointer-events:none}
        .hhHeroPhoto{position:absolute;inset:0 0 0 42%;z-index:1;overflow:hidden}
        .hhHeroPhoto img{width:100%;height:100%;object-fit:cover;object-position:52% center;filter:grayscale(.42) saturate(.62) contrast(1.17) brightness(.68);transform:scale(1.04)}
        .hhHeroPhoto:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#00162e 0%,rgba(0,21,45,.35) 34%,rgba(0,140,255,.25) 100%),linear-gradient(180deg,rgba(0,157,255,.06),rgba(0,0,0,.25));mix-blend-mode:color}
        .hhHeroCopy{position:relative;z-index:4;width:64%;padding:clamp(31px,6.3vw,54px) 0 0 clamp(24px,5vw,43px);text-shadow:0 3px 11px rgba(0,0,0,.55)}
        .hhHeroTitle{font-size:clamp(36px,7.8vw,67px);line-height:.98;letter-spacing:.01em;margin:0;color:#fff}
        .hhHeroTitle span{display:block}
        .hhHeroTitle .evolua{color:#3cc3ff;text-shadow:0 0 15px rgba(0,157,255,.68),0 2px 0 rgba(189,234,255,.22)}
        .hhHeroDesc{margin:clamp(18px,3.3vw,28px) 0 0;max-width:420px;font-size:clamp(14px,2.55vw,22px);line-height:1.28;color:#e0edf7;text-transform:none!important}
        .hhHeroDesc span{display:block;text-transform:none!important}

        .hhBrandChip{position:absolute;z-index:5;right:clamp(18px,5vw,43px);bottom:clamp(19px,4vw,34px);width:clamp(112px,22vw,190px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:
          radial-gradient(circle at 42% 32%,rgba(255,255,255,.48),transparent 9%),
          radial-gradient(circle,#0e4d7f 0 24%,#eff9ff 25% 31%,#09284b 32% 49%,transparent 50%),
          repeating-conic-gradient(from 4deg,#edf8ff 0 8deg,#123b62 8deg 19deg,#0a9dff 19deg 27deg,#123b62 27deg 38deg);
          box-shadow:inset 0 0 0 3px rgba(255,255,255,.36),inset 0 0 0 8px #0b3158,inset 0 0 18px rgba(255,255,255,.3),0 0 0 3px rgba(0,157,255,.36),0 0 28px rgba(0,157,255,.48),0 20px 34px rgba(0,0,0,.5);transform:rotate(-8deg) perspective(500px) rotateX(9deg)}
        .hhBrandChip:before{content:"";position:absolute;inset:10%;border-radius:50%;border:2px dashed rgba(189,234,255,.72);box-shadow:0 0 8px rgba(24,181,255,.45)}
        .hhBrandChip:after{content:"";position:absolute;left:9%;right:9%;bottom:-8%;height:13%;border-radius:0 0 50% 50%;background:linear-gradient(180deg,#081b32,#020b14);filter:blur(.3px);z-index:-1}
        .hhBrandChip img{width:50%;height:50%;object-fit:contain;filter:drop-shadow(0 2px 4px rgba(0,0,0,.55));position:relative;z-index:2}

        .hhModules{display:grid;gap:clamp(15px,2.7vw,23px);padding:0 clamp(18px,4vw,34px)}
        .hhModule{position:relative;display:grid;grid-template-columns:clamp(86px,18vw,154px) 1fr clamp(28px,6vw,52px);align-items:center;min-height:clamp(122px,20vw,173px);border-radius:clamp(20px,3.6vw,31px);overflow:hidden;text-decoration:none;background:linear-gradient(145deg,#f8fbff 0%,#eef7ff 55%,#dcebfa 100%);border:1.6px solid #009dff;box-shadow:inset 0 1px 0 rgba(255,255,255,.96),0 0 17px rgba(0,157,255,.26),0 13px 28px rgba(0,0,0,.24);color:#07163b;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
        .hhModule:before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.52),transparent 32%,rgba(24,181,255,.07) 70%,transparent);pointer-events:none}
        .hhModule:hover{border-color:#52caff;box-shadow:inset 0 1px 0 #fff,0 0 24px rgba(0,157,255,.38),0 16px 31px rgba(0,0,0,.28)}
        .hhModule:active{transform:scale(.985)}
        .hhModule:focus-visible{outline:3px solid #bdeaff;outline-offset:4px}
        .hhIconPane{height:100%;min-height:inherit;display:grid;place-items:center;background:
          radial-gradient(circle at 40% 25%,rgba(24,181,255,.3),transparent 34%),
          linear-gradient(145deg,#00152b,#002d5c 62%,#001a36);border-right:1px solid rgba(0,157,255,.45);box-shadow:inset -12px 0 24px rgba(0,0,0,.16)}
        .hhIconPane svg{width:clamp(52px,10.5vw,90px);height:auto;filter:drop-shadow(0 5px 7px rgba(0,0,0,.28))}
        .hhModuleText{padding:clamp(15px,2.7vw,23px) clamp(10px,2.4vw,21px)}
        .hhModuleTitle{margin:0;font-size:clamp(25px,4.65vw,40px);line-height:1;color:#07163b;letter-spacing:.01em}
        .hhModuleDesc{margin:.55em 0 0;font-size:clamp(15px,2.8vw,24px);line-height:1.16;color:#23385e;text-transform:none!important}
        .hhModuleDesc span{text-transform:none!important}
        .hhChevron{font-family:Arial,sans-serif!important;font-weight:300;font-size:clamp(34px,7vw,60px);color:#008cff;text-shadow:0 0 9px rgba(0,157,255,.22);justify-self:center;transform:translateY(-2px)}

        .hhFooter{padding:clamp(29px,6vw,52px) clamp(18px,4vw,34px) clamp(35px,7vw,60px);text-align:center}
        .hhFooterLine{height:1px;background:linear-gradient(90deg,transparent,#009dff 15%,#8fd7ff 50%,#009dff 85%,transparent);box-shadow:0 0 8px rgba(0,157,255,.34)}
        .hhFooterText{padding:clamp(13px,2.3vw,20px) 0;font-size:clamp(11px,2vw,17px);letter-spacing:.16em;color:#9ddfff;white-space:nowrap;text-shadow:0 0 8px rgba(0,157,255,.3)}

        @media(max-width:560px){
          .hhHeader{grid-template-columns:88px minmax(0,1fr) 83px;gap:6px;padding-left:14px;padding-right:14px}
          .hhLogo{width:82px}
          .hhBrandTop{font-size:clamp(22px,6.2vw,34px)}
          .hhBrandHeroes{font-size:clamp(44px,13.2vw,72px)}
          .hhBrandSub{font-size:clamp(8px,2.25vw,12px);letter-spacing:.11em}
          .hhCards{height:112px}
          .hhNav{padding-left:14px;padding-right:14px;gap:9px}
          .hhNavBtn{font-size:clamp(13px,3.7vw,18px);min-height:50px}
          .hhHero{margin-left:14px;margin-right:14px;min-height:390px}
          .hhHeroPhoto{inset:31% 0 0 32%}
          .hhHero:before{background:linear-gradient(180deg,rgba(0,18,38,.99) 0%,rgba(0,20,43,.9) 42%,rgba(0,18,39,.36) 71%,rgba(0,13,29,.28) 100%),radial-gradient(circle at 72% 60%,rgba(24,181,255,.24),transparent 34%)}
          .hhHeroCopy{width:91%;padding:28px 22px 0}
          .hhHeroTitle{font-size:clamp(38px,12vw,56px)}
          .hhHeroDesc{font-size:clamp(14px,4vw,18px);margin-top:15px;max-width:330px}
          .hhBrandChip{width:126px;right:20px;bottom:20px}
          .hhModules{padding-left:14px;padding-right:14px;gap:14px}
          .hhModule{grid-template-columns:88px minmax(0,1fr) 30px;min-height:128px;border-radius:22px}
          .hhIconPane svg{width:56px}
          .hhModuleText{padding:13px 9px 13px 14px}
          .hhModuleTitle{font-size:clamp(23px,6.3vw,30px)}
          .hhModuleDesc{font-size:clamp(14px,3.9vw,18px)}
          .hhFooter{padding-left:14px;padding-right:14px}
          .hhFooterText{font-size:clamp(9px,2.7vw,13px);letter-spacing:.09em}
        }

        @media(max-width:390px){
          .hhHeader{grid-template-columns:76px minmax(0,1fr) 70px;min-height:145px}
          .hhLogo{width:72px}
          .hhBrandTop{font-size:20px}
          .hhBrandHeroes{font-size:43px}
          .hhBrandSub{font-size:8px;letter-spacing:.08em}
          .hhCards{height:94px}
          .hhModule{grid-template-columns:78px minmax(0,1fr) 26px;min-height:122px}
          .hhIconPane svg{width:49px}
          .hhModuleTitle{font-size:22px}
          .hhModuleDesc{font-size:13.5px}
          .hhChevron{font-size:32px}
        }

        @media(prefers-reduced-motion:reduce){.hhNavBtn,.hhModule{transition:none!important}}
      `}</style>

      <main className="hhShell" aria-label="STACKUP HOLD’EM HEROES — menu principal">
        <header className="hhHeader">
          <div className="hhLogoWrap">
            <img className="hhLogo" src={OFFICIAL_LOGO} alt="Brasão oficial STACKUP HOLD’EM HEROES"/>
          </div>

          <div className="hhBrand">
            <div className="hhBrandTop">STACKUP HOLD’EM</div>
            <div className="hhBrandHeroes">HEROES</div>
            <div className="hhBrandSub">AI POKER PERFORMANCE SYSTEM.</div>
          </div>

          <HeaderCards/>
        </header>

        <nav className="hhNav" aria-label="Navegação principal">
          <button type="button" className="hhNavBtn" onClick={goBack} aria-label="Voltar para a tela anterior">
            <span className="hhNavIcon" aria-hidden="true">‹</span>
            <span>VOLTAR</span>
          </button>
          <Link className="hhNavBtn" href="/" aria-label="Abrir o menu principal">
            <span className="hhNavIcon" aria-hidden="true">⌂</span>
            <span>MENU PRINCIPAL</span>
          </Link>
        </nav>

        <section className="hhHero" aria-labelledby="hero-heading">
          <div className="hhHeroPhoto" aria-hidden="true">
            <img src={POKER_PHOTO} alt="" loading="eager"/>
          </div>

          <div className="hhHeroCopy">
            <h1 id="hero-heading" className="hhHeroTitle">
              <span>TREINE.</span>
              <span>ENTENDA.</span>
              <span className="evolua">EVOLUA.</span>
            </h1>
            <p className="hhHeroDesc" data-preserve-case="true">
              <span>Aprenda como você joga. Descubra seus leaks.</span>
              <span>Aprimore a estratégia e consolide suas decisões.</span>
            </p>
          </div>

          <div className="hhBrandChip" aria-hidden="true">
            <img src={OFFICIAL_LOGO} alt=""/>
          </div>
        </section>

        <section className="hhModules" aria-label="Módulos do aplicativo">
          {modules.map((item)=>(
            <Link key={item.href} href={item.href} className="hhModule" aria-label={`Abrir ${item.title}`}>
              <div className="hhIconPane"><ModuleIcon kind={item.icon}/></div>
              <div className="hhModuleText">
                <h2 className="hhModuleTitle">{item.title}</h2>
                <p className="hhModuleDesc" data-preserve-case="true">{item.description}</p>
              </div>
              <span className="hhChevron" aria-hidden="true">›</span>
            </Link>
          ))}
        </section>

        <footer className="hhFooter">
          <div className="hhFooterLine" aria-hidden="true"/>
          <div className="hhFooterText">EVOLUA SEU JOGO. UMA DECISÃO DE CADA VEZ.</div>
          <div className="hhFooterLine" aria-hidden="true"/>
        </footer>
      </main>
    </div>
  );
}
