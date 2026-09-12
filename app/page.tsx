"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";

const BACKGROUND_PARTS = [
  "/gemeo.stackup.holdem-heroes/stackup-heroes-home-v4-432.part0",
  "/gemeo.stackup.holdem-heroes/stackup-heroes-home-v4-432.part1",
  "/gemeo.stackup.holdem-heroes/stackup-heroes-home-v4-432.part2",
] as const;

const modules = [
  {
    href: "/player-dna",
    className: "heroesExactCard1",
    title: "PLAYER DNA",
    copy: <><span>Descubra seu perfil técnico</span><br/><span>com spots de treino variados.</span></>,
  },
  {
    href: "/poker-math-lab",
    className: "heroesExactCard2",
    title: "MATEMÁTICA DO POKER",
    copy: <><span>Aprenda odds, pot odds, MDF,</span><br/><span>SPR e conceitos essenciais.</span></>,
  },
  {
    href: "/ai-hand-review",
    className: "heroesExactCard3",
    title: "ANÁLISE DE MÃOS",
    copy: <><span>Envie cenários completos e</span><br/><span>receba avaliação estratégica.</span></>,
  },
  {
    href: "/poker-assistant",
    className: "heroesExactCard4",
    title: "PERGUNTE À IA",
    copy: <><span>Tire dúvidas sobre poker,</span><br/><span>estratégia, ranges e decisões.</span></>,
  },
] as const;

export default function Home(){
  const router = useRouter();
  const [backgroundSrc, setBackgroundSrc] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      BACKGROUND_PARTS.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return (await response.text()).trim();
      }),
    )
      .then((parts) => {
        if (!cancelled) setBackgroundSrc(`data:image/webp;base64,${parts.join("")}`);
      })
      .catch((error) => {
        console.error("Failed to load STACKUP HEROES home artwork", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const goBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <div className="heroesExactViewport">
      <style>{`
        html, body { margin:0!important; min-height:100%!important; background:#031a31!important; }
        body { overflow-x:hidden!important; -webkit-tap-highlight-color:transparent!important; }
        .heroesExactViewport,
        .heroesExactViewport * { box-sizing:border-box!important; }
        .heroesExactViewport {
          width:100%!important;
          min-height:100vh!important;
          display:flex!important;
          justify-content:center!important;
          align-items:flex-start!important;
          overflow-x:hidden!important;
          background:#031a31!important;
          font-family:var(--font-love-ya-like-a-sister), "Love Ya Like A Sister", cursive!important;
        }
        .heroesExactScreen {
          position:relative!important;
          width:min(100vw,864px)!important;
          aspect-ratio:864/1536!important;
          line-height:1!important;
          background:#031a31!important;
          user-select:none!important;
          -webkit-user-select:none!important;
          overflow:hidden!important;
          flex:0 0 auto!important;
        }
        .heroesExactArt {
          position:absolute!important;
          inset:0!important;
          display:block!important;
          width:100%!important;
          height:100%!important;
          object-fit:contain!important;
          pointer-events:none!important;
          border:0!important;
          margin:0!important;
          padding:0!important;
        }
        .heroesExactTxt {
          position:absolute!important;
          margin:0!important;
          padding:0!important;
          font-family:var(--font-love-ya-like-a-sister), "Love Ya Like A Sister", cursive!important;
          font-weight:400!important;
          font-style:normal!important;
        }
        .heroesExactHeaderBrand {
          left:30.7%!important;
          top:3.10%!important;
          width:49%!important;
          font-size:min(5.46vw,47.2px)!important;
          line-height:1.05!important;
          color:#fff!important;
          white-space:nowrap!important;
          text-align:left!important;
          text-shadow:0 1px 2px rgba(0,0,0,.3)!important;
        }
        .heroesExactHeaderHeroes {
          left:30.6%!important;
          top:6.20%!important;
          width:49%!important;
          font-size:min(9.83vw,85px)!important;
          line-height:.95!important;
          color:#fff!important;
          white-space:nowrap!important;
          text-align:left!important;
          text-shadow:0 2px 3px rgba(0,0,0,.28)!important;
        }
        .heroesExactHeaderSub {
          left:30.4%!important;
          top:11.85%!important;
          width:49%!important;
          font-size:min(2.325vw,20.1px)!important;
          line-height:1!important;
          color:#d7dbe5!important;
          white-space:nowrap!important;
          letter-spacing:min(.62vw,5.35px)!important;
          text-align:left!important;
        }
        .heroesExactHot {
          position:absolute!important;
          display:block!important;
          margin:0!important;
          padding:0!important;
          border:0!important;
          background:transparent!important;
          cursor:pointer!important;
          text-decoration:none!important;
          touch-action:manipulation!important;
          appearance:none!important;
          -webkit-appearance:none!important;
          outline:none!important;
          font-family:var(--font-love-ya-like-a-sister), "Love Ya Like A Sister", cursive!important;
          color:#fff!important;
          box-shadow:none!important;
        }
        .heroesExactHot:focus-visible {
          outline:2px solid rgba(255,255,255,.95)!important;
          outline-offset:-5px!important;
          border-radius:18px!important;
        }
        .heroesExactBack {
          left:5.21%!important;
          top:15.95%!important;
          width:43.52%!important;
          height:5.73%!important;
        }
        .heroesExactHome {
          left:51.04%!important;
          top:15.95%!important;
          width:44.10%!important;
          height:5.73%!important;
        }
        .heroesExactNavLabel {
          position:absolute!important;
          left:50%!important;
          top:50%!important;
          transform:translate(-50%,-50%)!important;
          font-size:min(3.47vw,30px)!important;
          line-height:1!important;
          white-space:nowrap!important;
          color:#fff!important;
          text-shadow:0 1px 2px rgba(0,0,0,.4)!important;
          text-align:center!important;
          font-weight:400!important;
        }
        .heroesExactHeroTitle {
          left:5.5%!important;
          width:56%!important;
          text-align:left!important;
          color:#fff!important;
          text-shadow:0 2px 4px rgba(0,0,0,.42)!important;
        }
        .heroesExactLine1 {
          top:23.65%!important;
          font-size:min(7.41vw,64px)!important;
          line-height:.98!important;
        }
        .heroesExactLine2 {
          top:28.05%!important;
          font-size:min(7.41vw,64px)!important;
          line-height:.98!important;
        }
        .heroesExactLine3 {
          top:32.55%!important;
          font-size:min(9.49vw,82px)!important;
          line-height:.94!important;
          background:linear-gradient(180deg,#ffffff 0%,#7bdcff 44%,#11a8ff 100%)!important;
          -webkit-background-clip:text!important;
          background-clip:text!important;
          color:transparent!important;
          text-shadow:none!important;
          filter:drop-shadow(0 2px 5px rgba(0,77,150,.55))!important;
        }
        .heroesExactHeroCopy {
          left:5.6%!important;
          top:39.45%!important;
          width:59%!important;
          font-size:min(2.55vw,22px)!important;
          line-height:1.35!important;
          color:#f3f3f3!important;
          text-align:left!important;
          text-shadow:0 1px 3px rgba(0,0,0,.4)!important;
        }
        .heroesExactCard {
          position:absolute!important;
          left:5.21%!important;
          width:89.58%!important;
          height:10.94%!important;
          display:block!important;
          margin:0!important;
          padding:0!important;
          border:0!important;
          background:transparent!important;
          text-decoration:none!important;
          color:inherit!important;
          font-family:var(--font-love-ya-like-a-sister), "Love Ya Like A Sister", cursive!important;
          box-shadow:none!important;
        }
        .heroesExactCard1 { top:45.83%!important; }
        .heroesExactCard2 { top:57.75%!important; }
        .heroesExactCard3 { top:69.34%!important; }
        .heroesExactCard4 { top:81.12%!important; }
        .heroesExactCardTitle {
          left:27.1%!important;
          top:12%!important;
          width:63%!important;
          font-size:min(4.28vw,37px)!important;
          line-height:1!important;
          color:#08134c!important;
          white-space:nowrap!important;
          text-align:left!important;
          font-weight:400!important;
        }
        .heroesExactCardCopy {
          left:27.4%!important;
          top:44%!important;
          width:62%!important;
          font-size:min(3.01vw,26px)!important;
          line-height:1.18!important;
          color:#26355e!important;
          text-align:left!important;
          font-weight:400!important;
        }
        .heroesExactFooter {
          left:20.6%!important;
          top:95.22%!important;
          width:60%!important;
          font-size:min(1.74vw,15px)!important;
          line-height:1!important;
          color:#7fa8d6!important;
          letter-spacing:min(.52vw,4.5px)!important;
          white-space:nowrap!important;
          text-align:center!important;
          font-weight:400!important;
        }
      `}</style>

      <main className="heroesExactScreen" aria-label="STACKUP HOLD’EM HEROES — menu de treinamento">
        {backgroundSrc ? (
          <img
            className="heroesExactArt"
            src={backgroundSrc}
            alt=""
            width="432"
            height="768"
            draggable="false"
          />
        ) : null}

        <div className="heroesExactTxt heroesExactHeaderBrand">STACKUP HOLD’EM</div>
        <div className="heroesExactTxt heroesExactHeaderHeroes">HEROES</div>
        <div className="heroesExactTxt heroesExactHeaderSub">AI POKER PERFORMANCE SYSTEM</div>

        <a className="heroesExactHot heroesExactBack" href="/" aria-label="Anterior" onClick={goBack}>
          <span className="heroesExactNavLabel">ANTERIOR</span>
        </a>
        <Link className="heroesExactHot heroesExactHome" href="/" aria-label="Menu principal">
          <span className="heroesExactNavLabel">MENU PRINCIPAL</span>
        </Link>

        <div className="heroesExactTxt heroesExactHeroTitle heroesExactLine1">TREINE.</div>
        <div className="heroesExactTxt heroesExactHeroTitle heroesExactLine2">ENTENDA.</div>
        <div className="heroesExactTxt heroesExactHeroTitle heroesExactLine3">EVOLUA.</div>
        <div className="heroesExactTxt heroesExactHeroCopy" data-preserve-case="true">
          Aprenda como você joga. Descubra seus leaks.<br/>
          Aprimore a estratégia e consolide suas decisões.
        </div>

        {modules.map((item) => (
          <Link
            key={item.href}
            className={`heroesExactCard ${item.className}`}
            href={item.href}
            aria-label={item.title}
          >
            <div className="heroesExactTxt heroesExactCardTitle">{item.title}</div>
            <div className="heroesExactTxt heroesExactCardCopy" data-preserve-case="true">{item.copy}</div>
          </Link>
        ))}

        <div className="heroesExactTxt heroesExactFooter">EVOLUA SEU JOGO. UMA DECISÃO DE CADA VEZ.</div>
      </main>
    </div>
  );
}
