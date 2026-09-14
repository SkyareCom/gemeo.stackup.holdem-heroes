"use client";

import {useEffect, useRef, useState} from "react";
import HomeModuleCard from "@/components/HomeModuleCard";

const ASSET_VERSION = "20260914-home-v25-unified-cards";
const EXPECTED_BASE64_LENGTH = 38700;
const PART_NAMES = [
  "home-clean-v9.part0",
  // part1 is intentionally excluded: it duplicates the second half of part0.
  "home-clean-v9.part2",
  "home-clean-v9.part3",
  "home-clean-v9.part4",
  "home-clean-v9.part5",
] as const;

const modules = [
  {href:"/player-dna", className:"card1", title:"PLAYER DNA", icon:"player" as const, copyLines:["Descubra seu perfil técnico","com spots de treino variados."] as const},
  {href:"/poker-math-lab", className:"card2", title:"MATEMÁTICA DO POKER", icon:"math" as const, copyLines:["Aprenda odds, pot odds, MDF,","SPR e conceitos essenciais."] as const},
  {href:"/ai-hand-review", className:"card3", title:"ANÁLISE DE MÃOS", icon:"hand" as const, copyLines:["Envie cenários completos e","receba avaliação estratégica."] as const},
  {href:"/poker-assistant", className:"card4", title:"PERGUNTE À IA", icon:"assistant" as const, copyLines:["Tire dúvidas sobre poker,","estratégia, ranges e decisões."] as const},
] as const;

const HIGHLIGHT_BLUE = "#23b8ff";
const HIGHLIGHT_SHADOW = "0 2px 2px rgba(0,10,35,.90),0 0 5px rgba(35,184,255,.70)";

async function fetchPart(name:string){
  const candidates = [
    `/gemeo.stackup.holdem-heroes/${name}?v=${ASSET_VERSION}`,
    `/${name}?v=${ASSET_VERSION}`,
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
  const [backgroundSrc,setBackgroundSrc] = useState("");
  const heroesRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLSpanElement>(null);

  useEffect(()=>{
    let cancelled = false;
    Promise.all(PART_NAMES.map(fetchPart))
      .then(parts=>{
        const base64 = parts.join("").replace(/\s+/g,"");
        if(base64.length !== EXPECTED_BASE64_LENGTH){
          throw new Error(`invalid homepage artwork length: ${base64.length}; expected ${EXPECTED_BASE64_LENGTH}`);
        }
        if(!cancelled) setBackgroundSrc(`data:image/webp;base64,${base64}`);
      })
      .catch(error=>console.error("STACKUP HEROES HOME ARTWORK LOAD FAILED",error));
    return()=>{cancelled=true};
  },[]);

  useEffect(()=>{
    const heroes = heroesRef.current;
    if(heroes){
      heroes.textContent = "HEROES";
      heroes.style.setProperty("font-size","26px","important");
      heroes.style.setProperty("color",HIGHLIGHT_BLUE,"important");
      heroes.style.setProperty("-webkit-text-fill-color",HIGHLIGHT_BLUE,"important");
      heroes.style.setProperty("font-family",'var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive',"important");
      heroes.style.setProperty("letter-spacing","0","important");
      heroes.style.setProperty("font-variant-ligatures","none","important");
      heroes.style.setProperty("-webkit-text-stroke","0","important");
      heroes.style.setProperty("text-shadow",HIGHLIGHT_SHADOW,"important");
    }
    const finalLine = finalRef.current;
    if(finalLine){
      finalLine.style.setProperty("font-size","18px","important");
      finalLine.style.setProperty("color",HIGHLIGHT_BLUE,"important");
      finalLine.style.setProperty("-webkit-text-fill-color",HIGHLIGHT_BLUE,"important");
      finalLine.style.setProperty("font-family",'var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive',"important");
      finalLine.style.setProperty("text-shadow",HIGHLIGHT_SHADOW,"important");
    }
  },[]);

  return (
    <div className="hxViewport">
      <style>{`
        html,body{margin:0!important;min-height:100%!important;background:#031a31!important}
        body{overflow-x:hidden!important;-webkit-tap-highlight-color:transparent!important}
        .hxViewport,.hxViewport *{box-sizing:border-box!important}
        .hxViewport{width:100%!important;min-height:100vh!important;display:flex!important;flex-direction:column!important;justify-content:flex-start!important;align-items:center!important;overflow-x:hidden!important;background:#031a31!important;font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important}
        .hxScreen{position:relative!important;width:min(100vw,864px)!important;aspect-ratio:864/1536!important;line-height:1!important;background:#031a31!important;overflow:hidden!important;flex:0 0 auto!important;isolation:isolate!important}
        .hxArt{position:absolute!important;inset:0!important;z-index:0!important;display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;pointer-events:none!important;border:0!important;margin:0!important;padding:0!important}

        .txt{position:absolute!important;z-index:70!important;margin:0!important;padding:0!important;font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;font-weight:400!important;font-style:normal!important}
        #homeBrand{left:30.7%!important;top:2.65%!important;width:68%!important;font-size:min(7.5348vw,65.136px)!important;line-height:1.02!important;color:#fff!important;-webkit-text-fill-color:#fff!important;white-space:nowrap!important;text-align:left!important;text-shadow:0 1px 2px rgba(0,0,0,.3)!important}
        #homeHeroes{left:30.6%!important;top:5.65%!important;width:68%!important;font-size:26px!important;line-height:.88!important;color:${HIGHLIGHT_BLUE}!important;-webkit-text-fill-color:${HIGHLIGHT_BLUE}!important;white-space:nowrap!important;text-align:left!important;letter-spacing:0!important;font-variant-ligatures:none!important;font-feature-settings:"liga" 0!important;-webkit-text-stroke:0!important;text-shadow:${HIGHLIGHT_SHADOW}!important}
        .sub{left:30.4%!important;top:11.95%!important;width:67.5%!important;font-size:min(2.05vw,17.7px)!important;line-height:1.05!important;color:#d7dbe5!important;white-space:nowrap!important;letter-spacing:min(.20vw,1.7px)!important;text-align:left!important;z-index:95!important;text-shadow:0 1px 2px rgba(0,0,0,.32)!important}

        #homeHeroMessage{position:absolute!important;z-index:80!important;left:5.5%!important;top:22.95%!important;width:89%!important;margin:0!important;padding:0!important;font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;font-size:min(5.1175vw,44.22px)!important;line-height:1.20!important;font-weight:400!important;font-style:normal!important;color:#fff!important;text-align:left!important;text-transform:none!important;text-shadow:0 2px 4px rgba(0,0,0,.42)!important}
        #homeHeroMessage span{display:block!important;white-space:nowrap!important;margin:0!important;padding:0!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
        #homeHeroFinal{font-size:18px!important;line-height:1.22!important;color:${HIGHLIGHT_BLUE}!important;-webkit-text-fill-color:${HIGHLIGHT_BLUE}!important;text-shadow:${HIGHLIGHT_SHADOW}!important}

        /* ONE VISUAL COMPONENT FOR ALL FIVE HOME CARDS */
        .homeModuleCard{z-index:120!important;display:block!important;margin:0!important;padding:0!important;overflow:hidden!important;box-sizing:border-box!important;text-decoration:none!important;font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;color:#08134c!important;border:1px solid #9edfff!important;border-radius:min(3.55vw,24px)!important;background:linear-gradient(180deg,#ffffff 0%,#f8fcff 54%,#eef8ff 100%)!important;box-shadow:0 0 0 1px #18a9f0,0 0 0 3px #073b69,0 2px 4px rgba(0,0,0,.17),inset 0 0 0 1px rgba(255,255,255,.94)!important}
        .heroModuleCard{position:absolute!important;left:5.21%!important;width:89.58%!important;height:10.94%!important}
        .card1{top:45.83%!important}.card2{top:57.75%!important}.card3{top:69.34%!important}.card4{top:81.12%!important}
        .footerModuleCard{position:relative!important;width:100%!important;height:min(19.45vw,168px)!important}

        .homeModuleIcon{position:absolute!important;z-index:2!important;left:4.15%!important;top:11%!important;width:18.05%!important;height:78%!important;display:flex!important;align-items:center!important;justify-content:center!important;border:1px solid #168bc8!important;border-radius:min(2.45vw,15px)!important;background:linear-gradient(180deg,#082b54 0%,#061f41 100%)!important;box-shadow:inset 0 0 8px rgba(35,184,255,.08)!important;color:#e8f8ff!important}
        .homeModuleIcon svg{display:block!important;width:58%!important;height:58%!important;color:#e8f8ff!important;fill:#e8f8ff!important;stroke:#e8f8ff!important}
        .homeModuleTitle{position:absolute!important;z-index:3!important;left:27.1%!important;top:12%!important;width:64%!important;margin:0!important;padding:0!important;font-size:min(4.28vw,37px)!important;line-height:1!important;font-weight:400!important;letter-spacing:.02em!important;color:#08134c!important;-webkit-text-fill-color:#08134c!important;white-space:nowrap!important;text-align:left!important}
        .homeModuleCopy{position:absolute!important;z-index:3!important;left:27.4%!important;top:44%!important;width:66%!important;margin:0!important;padding:0!important;font-size:min(3.01vw,26px)!important;line-height:1.18!important;font-weight:400!important;letter-spacing:.02em!important;color:#26355e!important;-webkit-text-fill-color:#26355e!important;white-space:nowrap!important;text-align:left!important;text-transform:none!important}
        .homeModuleArrow{position:absolute!important;z-index:3!important;right:4.45%!important;top:50%!important;transform:translateY(-50%)!important;width:min(3.45vw,26px)!important;height:min(5.8vw,43px)!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#0d8fe2!important}
        .homeModuleArrow svg{width:100%!important;height:100%!important;display:block!important;fill:none!important;stroke:#0d8fe2!important;stroke-width:4.5!important;stroke-linecap:round!important;stroke-linejoin:round!important}

        #homeFooterSection{position:relative!important;z-index:130!important;width:min(100vw,864px)!important;margin:max(-109px,-12.62vw) auto 0!important;padding:0 5.21% 34px!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important;font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important}
        #homeMotto{width:100%!important;margin:min(3.1vw,23px) 0 0!important;padding:0 0 4px!important;display:flex!important;align-items:baseline!important;justify-content:center!important;gap:7px!important;white-space:nowrap!important;text-align:center!important;font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;font-weight:400!important}
        #homeMottoUnderstand{font-size:18px!important;line-height:1!important;color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:0 2px 3px rgba(0,0,0,.5)!important}
        #homeMottoTrain{font-size:20px!important;line-height:1!important;color:#fff!important;-webkit-text-fill-color:#fff!important;text-shadow:0 2px 3px rgba(0,0,0,.5)!important}
        #homeMottoEvolve{font-size:26px!important;line-height:1!important;color:${HIGHLIGHT_BLUE}!important;-webkit-text-fill-color:${HIGHLIGHT_BLUE}!important;text-shadow:${HIGHLIGHT_SHADOW}!important}
      `}</style>

      <main className="hxScreen" data-manual-type-scale="true" aria-label="STACKUP HOLD’EM HEROES — menu de treinamento">
        {backgroundSrc && <img className="hxArt" src={backgroundSrc} alt="" width="432" height="768" draggable="false"/>}

        <div id="homeBrand" className="txt">STACKUP HOLD’EM</div>
        <div ref={heroesRef} id="homeHeroes" className="txt" aria-label="HEROES">HEROES</div>
        <div className="txt sub">AI POKER PERFORMANCE SYSTEM</div>

        <div id="homeHeroMessage" data-preserve-case="true">
          <span>Conheça seu jogo.</span>
          <span>Descubra leaks.</span>
          <span>Aprimore estratégias.</span>
          <span>Consolide decisões.</span>
          <span ref={finalRef} id="homeHeroFinal">Domine a mesa.</span>
        </div>

        {modules.map(item=><HomeModuleCard key={item.href} href={item.href} className={`heroModuleCard ${item.className}`} title={item.title} copyLines={item.copyLines} icon={item.icon}/>) }
      </main>

      <section id="homeFooterSection" data-manual-type-scale="true" aria-label="IDIOMA PRINCIPAL E MENSAGEM FINAL">
        <HomeModuleCard className="footerModuleCard" title="IDIOMA PRINCIPAL" copyLines={["Escolha o idioma para usar no","aplicativo"]} icon="language"/>
        <div id="homeMotto" aria-label="ENTENDA. TREINE. EVOLUA.">
          <span id="homeMottoUnderstand">ENTENDA.</span>
          <span id="homeMottoTrain">TREINE.</span>
          <span id="homeMottoEvolve">EVOLUA.</span>
        </div>
      </section>
    </div>
  );
}
