"use client";

import {useEffect} from "react";

const ACTION_NAMES=["FOLD","CHECK","CALL","BET","RAISE","ALL-IN"];
const RAISE_SIZES=["2X","2.5X","3X","4X"];
const BET_SIZES=["33%","50%","66%","POT"];

export default function PlayerDnaFixedActions(){
  useEffect(()=>{
    let scheduled=false;
    let feedbackTimer:number|undefined;

    const showUnavailable=(session:HTMLElement,label:string)=>{
      let feedback=session.querySelector<HTMLElement>("[data-fixed-player-feedback]");
      if(!feedback){
        feedback=document.createElement("div");
        feedback.dataset.fixedPlayerFeedback="true";
        feedback.className="player-dna-fixed-feedback";
        const fixed=session.querySelector<HTMLElement>("[data-fixed-player-actions-v2]");
        if(fixed)fixed.insertAdjacentElement("afterend",feedback);else session.appendChild(feedback);
      }
      feedback.textContent=`${label} NÃO É UMA OPÇÃO VÁLIDA PARA A SITUAÇÃO ATUAL.`;
      feedback.dataset.visible="true";
      if(feedbackTimer)window.clearTimeout(feedbackTimer);
      feedbackTimer=window.setTimeout(()=>{if(feedback?.isConnected)feedback.dataset.visible="false"},1200);
    };

    const apply=()=>{
      scheduled=false;
      const session=document.querySelector<HTMLElement>(".training-session");
      if(!session)return;

      const nativeActions=[...session.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')]
        .filter(button=>ACTION_NAMES.includes((button.textContent??"").trim())&&!button.closest("[data-fixed-player-actions-v2]"));
      if(!nativeActions.length)return;

      const actionBox=nativeActions[0]?.parentElement as HTMLElement|null;
      if(!actionBox)return;
      actionBox.style.setProperty("display","none","important");

      const actions=[...new Set(nativeActions.map(button=>(button.textContent??"").trim()))];
      const selected=nativeActions.find(button=>button.getAttribute("aria-pressed")==="true")?.textContent?.trim()??null;
      const raiseBase=actions.includes("RAISE")?"RAISE":actions.includes("BET")?"BET":"RAISE";
      const sizes=raiseBase==="BET"?BET_SIZES:RAISE_SIZES;

      const nativeSizing=[...session.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')]
        .filter(button=>[...RAISE_SIZES,...BET_SIZES,"25%","75%","125%","150%","SQUEEZE"].includes((button.textContent??"").trim())&&!button.closest("[data-fixed-player-actions-v2]"));
      const sizingBox=nativeSizing[0]?.parentElement as HTMLElement|null;
      if(sizingBox)sizingBox.style.setProperty("display","none","important");
      const selectedSizing=nativeSizing.find(button=>button.getAttribute("aria-pressed")==="true")?.textContent?.trim()??null;

      let fixed=session.querySelector<HTMLElement>("[data-fixed-player-actions-v2]");
      if(!fixed){
        fixed=document.createElement("div");
        fixed.dataset.fixedPlayerActionsV2="true";
        fixed.className="player-dna-fixed-actions-v2";
        actionBox.insertAdjacentElement("afterend",fixed);
        fixed.addEventListener("click",event=>{
          const target=(event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
          if(!target)return;
          if(target.dataset.available!=="true"){
            showUnavailable(session,target.textContent?.trim()||"AÇÃO");
            return;
          }
          const live=[...session.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')]
            .filter(button=>ACTION_NAMES.includes((button.textContent??"").trim())&&!button.closest("[data-fixed-player-actions-v2]"));
          const requested=target.dataset.action??"";
          const base=requested==="RAISE"?(live.some(button=>(button.textContent??"").trim()==="RAISE")?"RAISE":"BET"):requested;
          const baseButton=live.find(button=>(button.textContent??"").trim()===base);
          if(!baseButton){showUnavailable(session,target.textContent?.trim()||requested);return}
          if(baseButton.getAttribute("aria-pressed")!=="true")baseButton.click();
          const size=target.dataset.size;
          if(size){
            window.setTimeout(()=>{
              const current=[...session.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')]
                .find(button=>(button.textContent??"").trim()===size&&!button.closest("[data-fixed-player-actions-v2]"));
              if(current)current.click();else showUnavailable(session,target.textContent?.trim()||requested);
            },60);
          }
        });
      }

      const rows=[
        {label:"FOLD",action:"FOLD",size:""},
        {label:"CALL",action:"CALL",size:""},
        {label:"CHECK",action:"CHECK",size:""},
        ...sizes.map(size=>({label:`RAISE ${size}`,action:"RAISE",size})),
        {label:"ALL IN",action:"ALL-IN",size:""},
      ];

      fixed.innerHTML=rows.map(item=>{
        const base=item.action==="RAISE"?raiseBase:item.action;
        const available=actions.includes(base);
        const pressed=selected===base&&(!item.size||selectedSizing===item.size);
        return `<button type="button" data-action="${item.action}" data-size="${item.size}" data-available="${available}" aria-disabled="${!available}" aria-pressed="${pressed}" title="${available?item.label:`${item.label} INDISPONÍVEL NESTE SPOT`}">${item.label}</button>`;
      }).join("");
    };

    const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(apply)};
    const style=document.createElement("style");
    style.textContent=`
      .player-dna-fixed-actions-v2{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:5px 0}
      .player-dna-fixed-actions-v2 button{height:44px;min-height:44px;padding:5px 3px;border:1px solid #255000;border-radius:10px;background:rgba(31,54,31,.2);color:#ede6db;font-size:9px;font-weight:700;line-height:1.05;text-align:center;cursor:pointer;touch-action:manipulation}
      .player-dna-fixed-actions-v2 button[aria-pressed="true"]{border-color:#ede6db;color:#009929;box-shadow:inset 0 0 0 1px rgba(237,230,219,.22)}
      .player-dna-fixed-actions-v2 button[aria-disabled="true"]{opacity:.35;cursor:not-allowed}
      .player-dna-fixed-feedback{min-height:0;margin:0;text-align:center;font-size:9px;font-weight:700;letter-spacing:.03em;opacity:0;transform:translateY(-2px);transition:opacity .16s ease,transform .16s ease;pointer-events:none}
      .player-dna-fixed-feedback[data-visible="true"]{margin:4px 0 2px;opacity:.78;transform:translateY(0)}
      @media(max-width:800px){.player-dna-fixed-actions-v2{gap:4px}.player-dna-fixed-actions-v2 button{font-size:8px;padding:4px 2px}}
    `;
    document.head.appendChild(style);
    apply();
    const observer=new MutationObserver(schedule);
    observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["aria-pressed","aria-disabled"]});
    return()=>{if(feedbackTimer)window.clearTimeout(feedbackTimer);observer.disconnect();style.remove()};
  },[]);
  return null;
}
