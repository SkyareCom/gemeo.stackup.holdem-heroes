"use client";

import {useEffect} from "react";

const COMMAND_MAX_WIDTH="160px";
const COMMAND_HEIGHT="52px";
const COMMAND_FONT_SIZE="14px";
const TABLE_FONT_SIZE="10px";
const TABLE_FONT_FAMILY='var(--font-love-ya-like-a-sister), "Love Ya Like A Sister", cursive';
const SELECTED_BORDER="#F8FBFF";
const NORMAL_BORDER="#238FDF";
const NORMAL_TEXT="#238FDF";
const SELECTED_TEXT="#F8FBFF";
const SECONDARY_TEXT="#238FDF";
const COMMAND_BACKGROUND="#071A2D";
const SELECTED_BACKGROUND="#168EE8";

function forceFooter(){
  const footer=document.querySelector<HTMLElement>(".player-dna-page .training-footer");
  if(!footer)return;
  footer.style.setProperty("display","grid","important");
  footer.style.setProperty("grid-template-columns",`repeat(2,minmax(0,${COMMAND_MAX_WIDTH}))`,"important");
  footer.style.setProperty("justify-content","center","important");
  footer.style.setProperty("align-items","center","important");
  footer.style.setProperty("gap","10px","important");
  footer.style.setProperty("width","100%","important");
  footer.style.setProperty("max-width","100%","important");
  footer.style.setProperty("min-width","0","important");

  footer.querySelectorAll<HTMLButtonElement>(":scope > button").forEach(button=>{
    const selected=button.getAttribute("aria-pressed")==="true"||button.getAttribute("aria-selected")==="true"||button.classList.contains("active")||button.classList.contains("selected");
    const background=selected?SELECTED_BACKGROUND:COMMAND_BACKGROUND;
    const border=selected?SELECTED_BORDER:NORMAL_BORDER;
    const text=selected?SELECTED_TEXT:NORMAL_TEXT;

    button.style.setProperty("display","inline-flex","important");
    button.style.setProperty("align-items","center","important");
    button.style.setProperty("justify-content","center","important");
    button.style.setProperty("width","100%","important");
    button.style.setProperty("min-width","0","important");
    button.style.setProperty("max-width",COMMAND_MAX_WIDTH,"important");
    button.style.setProperty("height",COMMAND_HEIGHT,"important");
    button.style.setProperty("min-height",COMMAND_HEIGHT,"important");
    button.style.setProperty("max-height",COMMAND_HEIGHT,"important");
    button.style.setProperty("padding","0 10px","important");
    button.style.setProperty("margin","0","important");
    button.style.setProperty("box-sizing","border-box","important");
    button.style.setProperty("border",`2px solid ${border}`,"important");
    button.style.setProperty("border-radius","14px","important");
    button.style.setProperty("background",background,"important");
    button.style.setProperty("background-image","none","important");
    button.style.setProperty("color",text,"important");
    button.style.setProperty("-webkit-text-fill-color",text,"important");
    button.style.setProperty("font-size",COMMAND_FONT_SIZE,"important");
    button.style.setProperty("font-weight","400","important");
    button.style.setProperty("line-height","1","important");
    button.style.setProperty("text-align","center","important");
    button.style.setProperty("white-space","nowrap","important");
    button.style.setProperty("justify-self","stretch","important");
    button.style.setProperty("flex","none","important");
    button.style.setProperty("overflow","hidden","important");
    button.style.setProperty("box-shadow",selected?`inset 0 0 0 1px ${SELECTED_BORDER}`:"none","important");

    button.querySelectorAll<HTMLElement>("*").forEach(child=>{
      child.style.setProperty("color",text,"important");
      child.style.setProperty("-webkit-text-fill-color",text,"important");
      child.style.setProperty("font-size",COMMAND_FONT_SIZE,"important");
      child.style.setProperty("font-weight","400","important");
      child.style.setProperty("line-height","1","important");
      child.style.setProperty("white-space","nowrap","important");
      child.style.setProperty("overflow","hidden","important");
      child.style.setProperty("text-overflow","ellipsis","important");
    });
  });
}

function forcePokerTableTypography(){
  document.querySelectorAll<HTMLElement>(".player-dna-page *").forEach(host=>{
    const root=host.shadowRoot;
    if(!root||!root.querySelector(".scene"))return;

    const selectors=[
      ".scene",
      ".plate b",
      ".stack",
      ".levelinfo b",
      ".levelinfo span",
      ".pot",
      ".sidepot",
      ".street",
      ".heroaction",
      ".herostack",
      ".heroplate b",
      ".heroplate small",
      ".action"
    ].join(",");

    root.querySelectorAll<HTMLElement>(selectors).forEach(element=>{
      element.style.setProperty("font-family",TABLE_FONT_FAMILY,"important");
      element.style.setProperty("font-size",TABLE_FONT_SIZE,"important");
      element.style.setProperty("line-height","1.1","important");
      element.style.setProperty("max-width","100%","important");
    });

    root.querySelectorAll<HTMLElement>(".action,.heroaction,.pot,.sidepot,.levelinfo,.plate,.stack,.street,.herostack,.heroplate").forEach(element=>{
      element.style.setProperty("white-space","nowrap","important");
    });
  });
}

function paintDepthSelection(selected:HTMLButtonElement|null){
  document.querySelectorAll<HTMLButtonElement>(".player-dna-page .depth-choices > button").forEach(button=>{
    const active=button===selected;
    const nextPressed=active?"true":"false";
    if(button.getAttribute("aria-pressed")!==nextPressed)button.setAttribute("aria-pressed",nextPressed);

    const text=active?SELECTED_TEXT:NORMAL_TEXT;
    button.style.setProperty("border",`2px solid ${active?SELECTED_BORDER:NORMAL_BORDER}`,"important");
    button.style.setProperty("background",active?SELECTED_BACKGROUND:COMMAND_BACKGROUND,"important");
    button.style.setProperty("background-image","none","important");
    button.style.setProperty("color",text,"important");
    button.style.setProperty("-webkit-text-fill-color",text,"important");
    button.style.setProperty("box-shadow",active?`inset 0 0 0 1px ${SELECTED_BORDER}`:"none","important");

    const strong=button.querySelector<HTMLElement>("strong");
    if(strong){
      strong.style.setProperty("color",text,"important");
      strong.style.setProperty("-webkit-text-fill-color",text,"important");
    }
    const span=button.querySelector<HTMLElement>("span");
    if(span){
      const color=active?SELECTED_TEXT:SECONDARY_TEXT;
      span.style.setProperty("color",color,"important");
      span.style.setProperty("-webkit-text-fill-color",color,"important");
    }
  });
}

export default function PlayerDnaUiEnforcer(){
  useEffect(()=>{
    let pendingStart:number|undefined;

    const apply=()=>{
      forceFooter();
      forcePokerTableTypography();
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
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["aria-pressed","aria-selected","class"]});
    const typographyEnforcer=window.setInterval(forcePokerTableTypography,300);
    apply();

    return()=>{
      document.removeEventListener("click",onDepthClick,true);
      observer.disconnect();
      window.clearInterval(typographyEnforcer);
      if(pendingStart!==undefined)window.clearTimeout(pendingStart);
    };
  },[]);

  return null;
}
