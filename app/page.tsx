"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

const ASSET_VERSION = "20260912-1344-screenfit";
const PART_NAMES = [
  "stackup-heroes-home-v4-432.part0",
  "stackup-heroes-home-v4-432.part1",
  "stackup-heroes-home-v4-432.part2",
] as const;

const modules = [
  {href:"/player-dna", className:"card1", title:"PLAYER DNA", copy:<><span>Descubra seu perfil técnico</span><br/><span>com spots de treino variados.</span></>},
  {href:"/poker-math-lab", className:"card2", title:"MATEMÁTICA DO POKER", copy:<><span>Aprenda odds, pot odds, MDF,</span><br/><span>SPR e conceitos essenciais.</span></>},
  {href:"/ai-hand-review", className:"card3", title:"ANÁLISE DE MÃOS", copy:<><span>Envie cenários completos e</span><br/><span>receba avaliação estratégica.</span></>},
  {href:"/poker-assistant", className:"card4", title:"PERGUNTE À IA", copy:<><span>Tire dúvidas sobre poker,</span><br/><span>estratégia, ranges e decisões.</span></>},
] as const;

async function fetchPart(name:string){
  const candidates = [
    `./${name}?v=${ASSET_VERSION}`,
    `./gemeo.stackup.holdem-heroes/${name}?v=${ASSET_VERSION}`,
  ];
  let lastError:unknown;
  for(const url of candidates){
    try{
      const response = await fetch(url,{cache:"no-store"});
      if(!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const text = (await response.text()).trim();
      if(!text || text.length < 1000) throw new Error(`asset fragment too short: ${text.length}`);
      return text;
    }catch(error){
      lastError = error;
    }
  }
  throw lastError ?? new Error(`Unable to load ${name}`);
}

export default function Home(){
  const router = useRouter();
  const [backgroundSrc,setBackgroundSrc] = useState("");

  useEffect(()=>{
    let cancelled = false;
    Promise.all(PART_NAMES.map(fetchPart))
      .then(parts=>{
        const base64 = parts.join("").replace(/\s+/g,"");
        if(base64.length < 40000) throw new Error(`incomplete homepage artwork: ${base64.length}`);
        if(!cancelled) setBackgroundSrc(`data:image/webp;base64,${base64}`);
      })
      .catch(error=>console.error("STACKUP HEROES HOME ARTWORK LOAD FAILED",error));
    return()=>{cancelled=true};
  },[]);

  const goBack=(event:React.MouseEvent<HTMLAnchorElement>)=>{
    event.preventDefault();
    if(window.history.length>1) router.back();
    else router.push("/");
  };

  return (
    <div className="hxViewport">
      <style>{`
        html,body{margin:0!important;min-height:100%!important;background:#031a31!important}
        body{overflow-x:hidden!important;-webkit-tap-highlight-color:transparent!important}
        .hxViewport,.hxViewport *{box-sizing:border-box!important}
        .hxViewport{width:100%!important;min-height:100vh!important;display:flex!important;justify-content:center!important;align-items:flex-start!important;overflow-x:hidden!important;background:#031a31!important;font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important}
        .hxScreen{position:relative!important;width:min(100vw,864px)!important;aspect-ratio:864/1536!important;line-height:1!important;background:#031a31!important;overflow:hidden!important;flex:0 0 auto!important;isolation:isolate!important}
        .hxArt{position:absolute!important;inset:0!important;z-index:0!important;display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;pointer-events:none!important;border:0!important;margin:0!important;padding:0!important}
        .txt{position:absolute!important;z-index:2!important;margin:0!important;padding:0!important;font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;font-weight:400!important;font-style:normal!important}
        .brand{left:30.7%!important;top:3.10%!important;width:49%!important;font-size:min(5.46vw,47.2px)!important;line-height:1.05!important;color:#fff!important;white-space:nowrap!important;text-align:left!important;text-shadow:0 1px 2px rgba(0,0,0,.3)!important}
        .heroes{left:30.6%!important;top:6.20%!important;width:49%!important;font-size:min(9.83vw,85px)!important;line-height:.95!important;color:#fff!important;white-space:nowrap!important;text-align:left!important;text-shadow:0 2px 3px rgba(0,0,0,.28)!important}
        .sub{left:30.4%!important;top:11.85%!important;width:49%!important;font-size:min(2.325vw,20.1px)!important;line-height:1!important;color:#d7dbe5!important;white-space:nowrap!important;letter-spacing:min(.62vw,5.35px)!important;text-align:left!important}
        .hot{position:absolute!important;z-index:4!important;display:block!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;cursor:pointer!important;text-decoration:none!important;touch-action:manipulation!important;appearance:none!important;-webkit-appearance:none!important;outline:none!important;font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;color:#fff!important;box-shadow:none!important}
        .hot:focus-visible{outline:2px solid rgba(255,255,255,.95)!important;outline-offset:-5px!important;border-radius:18px!important}
        .back{left:5.21%!important;top:15.95%!important;width:43.52%!important;height:5.73%!important}
        .home{left:51.04%!important;top:15.95%!important;width:44.10%!important;height:5.73%!important}
        .navLabel{position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;font-size:min(3.47vw,30px)!important;line-height:1!important;white-space:nowrap!important;color:#fff!important;text-shadow:0 1px 2px rgba(0,0,0,.4)!important;text-align:center!important;font-weight:400!important}
        .heroTitle{left:5.5%!important;width:56%!important;text-align:left!important;color:#fff!important;text-shadow:0 2px 4px rgba(0,0,0,.42)!important}
        .line1{top:23.65%!important;font-size:min(7.41vw,64px)!important;line-height:.98!important}
        .line2{top:28.05%!important;font-size:min(7.41vw,64px)!important;line-height:.98!important}
        .line3{top:32.55%!important;font-size:min(9.49vw,82px)!important;line-height:.94!important;color:#23b8ff!important;-webkit-text-fill-color:#23b8ff!important;text-shadow:0 1px 0 #dff7ff,0 0 8px rgba(0,166,255,.75),0 2px 5px rgba(0,77,150,.65)!important}
        .heroCopy{left:5.6%!important;top:39.45%!important;width:88%!important;font-size:min(2.55vw,22px)!important;line-height:1.35!important;color:#f3f3f3!important;text-align:left!important;text-shadow:0 1px 3px rgba(0,0,0,.4)!important;white-space:nowrap!important}
        .moduleCard{position:absolute!important;z-index:4!important;left:5.21%!important;width:89.58%!important;height:10.94%!important;display:block!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;text-decoration:none!important;color:inherit!important;font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;box-shadow:none!important}
        .card1{top:45.83%!important}.card2{top:57.75%!important}.card3{top:69.34%!important}.card4{top:81.12%!important}
        .cardTitle{left:27.1%!important;top:12%!important;width:66%!important;font-size:min(4.28vw,37px)!important;line-height:1!important;color:#08134c!important;white-space:nowrap!important;text-align:left!important;font-weight:400!important}
        .cardCopy{left:27.4%!important;top:44%!important;width:68%!important;font-size:min(3.01vw,26px)!important;line-height:1.18!important;color:#26355e!important;text-align:left!important;font-weight:400!important;white-space:nowrap!important}
        .footer{left:8%!important;top:95.22%!important;width:84%!important;font-size:min(1.55vw,13.4px)!important;line-height:1!important;color:#7fa8d6!important;letter-spacing:min(.38vw,3.3px)!important;white-space:nowrap!important;text-align:center!important;font-weight:400!important}
      `}</style>

      <main className="hxScreen" aria-label="STACKUP HOLD’EM HEROES — menu de treinamento">
        {backgroundSrc && <img className="hxArt" src={backgroundSrc} alt="" width="432" height="768" draggable="false"/>}

        <div className="txt brand">STACKUP HOLD’EM</div>
        <div className="txt heroes">HEROES</div>
        <div className="txt sub">AI POKER PERFORMANCE SYSTEM</div>

        <a className="hot back" href="/" aria-label="Anterior" onClick={goBack}><span className="navLabel">ANTERIOR</span></a>
        <Link className="hot home" href="/" aria-label="Menu principal"><span className="navLabel">MENU PRINCIPAL</span></Link>

        <div className="txt heroTitle line1">TREINE.</div>
        <div className="txt heroTitle line2">ENTENDA.</div>
        <div className="txt heroTitle line3">EVOLUA.</div>
        <div className="txt heroCopy" data-preserve-case="true">Aprenda como você joga. Descubra seus leaks.<br/>Aprimore a estratégia e consolide suas decisões.</div>

        {modules.map(item=><Link key={item.href} className={`moduleCard ${item.className}`} href={item.href} aria-label={item.title}>
          <div className="txt cardTitle">{item.title}</div>
          <div className="txt cardCopy" data-preserve-case="true">{item.copy}</div>
        </Link>)}

        <div className="txt footer">EVOLUA SEU JOGO. UMA DECISÃO DE CADA VEZ.</div>
      </main>
    </div>
  );
}
