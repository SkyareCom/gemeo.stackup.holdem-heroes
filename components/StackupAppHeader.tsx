"use client";

import Link from "next/link";
import {useEffect, useState} from "react";

const ASSET_VERSION = "20260914-secondary-home-header-v1";
const EXPECTED_BASE64_LENGTH = 38700;
const PART_NAMES = [
  "home-clean-v9.part0",
  "home-clean-v9.part2",
  "home-clean-v9.part3",
  "home-clean-v9.part4",
  "home-clean-v9.part5",
] as const;

const HOME_BACKGROUND = "#031a31";
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

export default function StackupAppHeader(){
  const [backgroundSrc,setBackgroundSrc] = useState("");

  useEffect(()=>{
    let cancelled = false;
    Promise.all(PART_NAMES.map(fetchPart))
      .then(parts=>{
        const base64 = parts.join("").replace(/\s+/g,"");
        if(base64.length !== EXPECTED_BASE64_LENGTH){
          throw new Error(`invalid secondary header artwork length: ${base64.length}; expected ${EXPECTED_BASE64_LENGTH}`);
        }
        if(!cancelled) setBackgroundSrc(`data:image/webp;base64,${base64}`);
      })
      .catch(error=>console.error("STACKUP HEROES SECONDARY HEADER ARTWORK LOAD FAILED",error));
    return()=>{cancelled=true};
  },[]);

  useEffect(()=>{
    const html = document.documentElement;
    const body = document.body;
    const modulePages = Array.from(document.querySelectorAll<HTMLElement>("main.module-page"));

    html.style.setProperty("background",HOME_BACKGROUND,"important");
    html.style.setProperty("background-image","none","important");
    body.style.setProperty("background",HOME_BACKGROUND,"important");
    body.style.setProperty("background-image","none","important");
    modulePages.forEach(page=>{
      page.style.setProperty("min-height","100vh","important");
      page.style.setProperty("background",HOME_BACKGROUND,"important");
      page.style.setProperty("background-color",HOME_BACKGROUND,"important");
      page.style.setProperty("background-image","none","important");
    });

    return()=>{
      html.style.removeProperty("background");
      html.style.removeProperty("background-image");
      body.style.removeProperty("background");
      body.style.removeProperty("background-image");
      modulePages.forEach(page=>{
        page.style.removeProperty("min-height");
        page.style.removeProperty("background");
        page.style.removeProperty("background-color");
        page.style.removeProperty("background-image");
      });
    };
  },[]);

  return <>
    <style>{`
      html body main.module-page{
        min-height:100vh!important;
        background:${HOME_BACKGROUND}!important;
        background-color:${HOME_BACKGROUND}!important;
        background-image:none!important;
      }

      html body main.module-page .stackup-home-clone-header{
        position:relative!important;
        isolation:isolate!important;
        overflow:hidden!important;
        display:block!important;
        width:min(calc(100% + 36px),864px)!important;
        aspect-ratio:864/230!important;
        min-height:0!important;
        margin:-28px auto 18px!important;
        padding:0!important;
        border:0!important;
        border-radius:0!important;
        background:${HOME_BACKGROUND}!important;
        background-color:${HOME_BACKGROUND}!important;
        background-image:none!important;
        box-shadow:none!important;
        font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
      }

      html body main.module-page .stackup-home-clone-link{
        position:absolute!important;
        inset:0!important;
        z-index:1!important;
        display:block!important;
        width:100%!important;
        height:100%!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        background-image:none!important;
        box-shadow:none!important;
        text-decoration:none!important;
        overflow:hidden!important;
        font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
      }

      html body main.module-page .stackup-home-clone-art{
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
        object-fit:contain!important;
        pointer-events:none!important;
      }

      html body main.module-page .stackup-home-clone-text{
        position:absolute!important;
        z-index:5!important;
        display:block!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
        background-image:none!important;
        font-family:var(--font-love-ya-like-a-sister),"Love Ya Like A Sister",cursive!important;
        font-weight:400!important;
        font-style:normal!important;
        text-align:left!important;
        white-space:nowrap!important;
      }

      html body main.module-page .stackup-home-clone-brand{
        left:30.7%!important;
        top:17.7%!important;
        width:68%!important;
        font-size:min(7.5348vw,65.136px)!important;
        line-height:1.02!important;
        letter-spacing:.02em!important;
        color:#fff!important;
        -webkit-text-fill-color:#fff!important;
        text-shadow:0 1px 2px rgba(0,0,0,.3)!important;
      }

      html body main.module-page .stackup-home-clone-heroes{
        left:30.6%!important;
        top:37.7%!important;
        width:68%!important;
        font-size:26px!important;
        line-height:.88!important;
        letter-spacing:0!important;
        font-variant-ligatures:none!important;
        font-feature-settings:"liga" 0!important;
        -webkit-text-stroke:0!important;
        color:${HIGHLIGHT_BLUE}!important;
        -webkit-text-fill-color:${HIGHLIGHT_BLUE}!important;
        text-shadow:${HIGHLIGHT_SHADOW}!important;
      }

      html body main.module-page .stackup-home-clone-subtitle{
        left:30.4%!important;
        top:79.8%!important;
        width:67.5%!important;
        font-size:min(2.05vw,17.7px)!important;
        line-height:1.05!important;
        letter-spacing:min(.20vw,1.7px)!important;
        color:#d7dbe5!important;
        -webkit-text-fill-color:#d7dbe5!important;
        text-shadow:0 1px 2px rgba(0,0,0,.32)!important;
      }

      @media(max-width:560px){
        html body main.module-page .stackup-home-clone-header{
          width:calc(100% + 36px)!important;
          max-width:864px!important;
          margin:-28px -18px 14px!important;
        }
      }
    `}</style>

    <header className="stackup-home-clone-header" aria-label="STACKUP HOLD'EM HEROES">
      <Link className="stackup-home-clone-link" href="/" aria-label="STACKUP HOLD'EM HEROES — INÍCIO">
        {backgroundSrc && <img className="stackup-home-clone-art" src={backgroundSrc} alt="" width="864" height="1536" draggable="false"/>}
        <span className="stackup-home-clone-text stackup-home-clone-brand">STACKUP HOLD’EM</span>
        <span className="stackup-home-clone-text stackup-home-clone-heroes">HEROES</span>
        <span className="stackup-home-clone-text stackup-home-clone-subtitle">AI POKER PERFORMANCE SYSTEM</span>
      </Link>
    </header>
  </>;
}
