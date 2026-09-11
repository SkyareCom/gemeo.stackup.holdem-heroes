"use client";

import {useEffect} from "react";

const COMMAND_WIDTH="160px";
const COMMAND_HEIGHT="44px";
const SELECTED_BORDER="#ede6db";
const NORMAL_BORDER="#183426";
const PASTEL="#ede6db";

function forceFooter(){
  const footer=document.querySelector<HTMLElement>(".player-dna-page .training-footer");
  if(!footer)return;
  footer.style.setProperty("display","grid","important");
  footer.style.setProperty("grid-template-columns",`repeat(2,${COMMAND_WIDTH})`,"important");
  footer.style.setProperty("justify-content","center","important");
  footer.style.setProperty("align-items","center","important");
  footer.style.setProperty("gap","8px","important");
  footer.style.setProperty("width","100%","important");
  footer.querySelectorAll<HTMLButtonElement>(":scope > button").forEach(button=>{
    button.style.setProperty("display","inline-flex","important");
    button.style.setProperty("align-items","center","important");
    button.style.setProperty("justify-content","center","important");
    button.style.setProperty("width",COMMAND_WIDTH,"important");
    button.style.setProperty("min-width",COMMAND_WIDTH,"important");
    button.style.setProperty("max-width",COMMAND_WIDTH,"important");
    button.style.setProperty("height",COMMAND_HEIGHT,"important");
    button.style.setProperty("min-height",COMMAND_HEIGHT,"important");
    button.style.setProperty("max-height",COMMAND_HEIGHT,"important");
    button.style.setProperty("padding","0 8px","important");
    button.style.setProperty("margin","0","important");
    button.style.setProperty("box-sizing","border-box","important");
    button.style.setProperty("border","1px solid #255000","important");
    button.style.setProperty("border-radius","12px","important");
    button.style.setProperty("background","rgba(0,100,20,.07)","important");
    button.style.setProperty("background-image","none","important");
    button.style.setProperty("color","#009929","important");
    button.style.setProperty("-webkit-text-fill-color","#009929","important");
    button.style.setProperty("font-size","10px","important");
    button.style.setProperty("font-weight","400","important");
    button.style.setProperty("line-height","1","important");
    button.style.setProperty("text-align","center","important");
    button.style.setProperty("white-space","nowrap","important");
    button.style.setProperty("justify-self","center","important");
    button.style.setProperty("flex",`0 0 ${COMMAND_WIDTH}`,"important");
    button.style.setProperty("overflow","visible","important");
    button.querySelectorAll<HTMLElement>("*").forEach(child=>{
      child.style.setProperty("color","#009929","important");
      child.style.setProperty("-webkit-text-fill-color","#009929","important");
      child.style.setProperty("font-size","10px","important");
      child.style.setProperty("font-weight","400","important");
      child.style.setProperty("line-height","1","important");
      child.style.setProperty("white-space","nowrap","important");
      child.style.setProperty("overflow","visible","important");
    });
  });
}

function paintDepthSelection(selected:HTMLButtonElement|null){
  document.querySelectorAll<HTMLButtonElement>(".player-dna-page .depth-choices > button").forEach(button=>{
    const active=button===selected;
    const nextPressed=active?"true":"false";
    if(button.getAttribute("aria-pressed")!==nextPressed)button.setAttribute("aria-pressed",nextPressed);
    button.style.setProperty("border",active?`2px solid ${SELECTED_BORDER}`:`1px solid ${NORMAL_BORDER}`,"important");
    button.style.setProperty("box-shadow",active?`inset 0 0 0 1px ${SELECTED_BORDER},0 0 12px rgba(237,230,219,.22)`:"none","important");
    button.style.setProperty("background",active?PASTEL:"#0b1710","important");
    button.style.setProperty("background-color",active?PASTEL:"#0b1710","important");
    button.style.setProperty("color",active?"#000000":"#edf7f0","important");
    button.style.setProperty("-webkit-text-fill-color",active?"#000000":"#edf7f0","important");
    button.querySelectorAll<HTMLElement>("strong,span").forEach(child=>{
      child.style.setProperty("color",active?"#000000":"#edf7f0","important");
      child.style.setProperty("-webkit-text-fill-color",active?"#000000":"#edf7f0","important");
    });
  });
}

export default function PlayerDnaUiEnforcer(){
  useEffect(()=>{
    let pendingStart:number|undefined;
    const apply=()=>{
      forceFooter();
      const selected=document.querySelector<HTMLButtonElement>('.player-dna-page .depth-choices > button[aria-pressed="true"]');
      if(selected)paintDepthSelection(selected);
    };

    const onDepthClick=(event:MouseEvent)=>{
      const target=event.target instanceof Element?event.target.closest<HTMLButtonElement>(".player-dna-page .depth-choices > button"):null;
      if(!target)return;
      if(target.dataset.playerDnaStartBypass==="1"){
        delete target.dataset.playerDnaStartBypass;
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      paintDepthSelection(target);
      if(pendingStart!==undefined)window.clearTimeout(pendingStart);
      pendingStart=window.setTimeout(()=>{
        target.dataset.playerDnaStartBypass="1";
        target.click();
      },900);
    };

    document.addEventListener("click",onDepthClick,true);
    const observer=new MutationObserver(apply);
    observer.observe(document.body,{subtree:true,childList:true});
    apply();
    return()=>{
      document.removeEventListener("click",onDepthClick,true);
      observer.disconnect();
      if(pendingStart!==undefined)window.clearTimeout(pendingStart);
    };
  },[]);
  return null;
}
