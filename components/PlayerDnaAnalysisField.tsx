"use client";

import {useEffect} from "react";

type Mix={correct:string;adjustable:string;incorrect:string;percentages:Record<string,number>};

const MIXES:{match:string;mix:Mix}[]=[
  {match:"BTN VS BB / 3-BET POT",mix:{correct:"CALL",adjustable:"RAISE",incorrect:"FOLD / ALL-IN",percentages:{FOLD:12,CALL:58,RAISE:27,"ALL-IN":3}}},
  {match:"BLIND WAR / SB VS BB",mix:{correct:"RAISE",adjustable:"CALL",incorrect:"FOLD / ALL-IN",percentages:{FOLD:8,CALL:37,RAISE:50,"ALL-IN":5}}},
  {match:"CO VS BTN / SRP",mix:{correct:"CALL",adjustable:"RAISE",incorrect:"FOLD / ALL-IN",percentages:{FOLD:5,CALL:68,RAISE:24,"ALL-IN":3}}},
  {match:"MULTIWAY / BB VS HJ VS BTN",mix:{correct:"CALL",adjustable:"FOLD",incorrect:"RAISE / ALL-IN",percentages:{FOLD:24,CALL:62,RAISE:11,"ALL-IN":3}}},
  {match:"CO VS BB / 2ND BARREL",mix:{correct:"CALL",adjustable:"FOLD",incorrect:"RAISE / ALL-IN",percentages:{FOLD:31,CALL:57,RAISE:10,"ALL-IN":2}}},
  {match:"BTN VS BB / THIN VALUE",mix:{correct:"BET",adjustable:"CHECK",incorrect:"RAISE / ALL-IN",percentages:{CHECK:34,BET:62,RAISE:3,"ALL-IN":1}}},
  {match:"BTN VS BB / OVERBET",mix:{correct:"CALL",adjustable:"FOLD",incorrect:"RAISE / ALL-IN",percentages:{FOLD:39,CALL:56,RAISE:4,"ALL-IN":1}}},
  {match:"SIDE POT / CO VS BTN VS SB",mix:{correct:"RAISE",adjustable:"CALL",incorrect:"FOLD / ALL-IN",percentages:{FOLD:4,CALL:39,RAISE:52,"ALL-IN":5}}},
  {match:"EARLY GAME / ANTE 0.1 BB / UTG VS CO VS SB",mix:{correct:"RAISE",adjustable:"CALL",incorrect:"FOLD / ALL-IN",percentages:{FOLD:5,CALL:24,RAISE:66,"ALL-IN":5}}},
  {match:"MID GAME / ANTE 0.1 BB / BLIND WAR",mix:{correct:"RAISE",adjustable:"CALL",incorrect:"FOLD / ALL-IN",percentages:{FOLD:9,CALL:33,RAISE:52,"ALL-IN":6}}},
  {match:"BOLHA / BOLHA ICM / ANTE 0.1 BB / CO VS BTN",mix:{correct:"CALL",adjustable:"FOLD",incorrect:"RAISE / ALL-IN",percentages:{FOLD:36,CALL:59,RAISE:4,"ALL-IN":1}}},
  {match:"ITM / ANTE 0.1 BB / BTN VS BB / COMBO DRAW",mix:{correct:"RAISE",adjustable:"CALL",incorrect:"FOLD / ALL-IN",percentages:{FOLD:2,CALL:38,RAISE:55,"ALL-IN":5}}},
  {match:"FT / FT ICM / ANTE 0.1 BB / MULTIWAY",mix:{correct:"FOLD",adjustable:"CALL",incorrect:"RAISE / ALL-IN",percentages:{FOLD:61,CALL:34,RAISE:4,"ALL-IN":1}}},
  {match:"FT / FT ICM / SIDE POT / BTN VS SB VS BB",mix:{correct:"RAISE",adjustable:"CALL",incorrect:"FOLD / ALL-IN",percentages:{FOLD:3,CALL:41,RAISE:51,"ALL-IN":5}}},
  {match:"BOLHA / BOLHA ICM / CO VS BTN / BLUFF CATCH",mix:{correct:"FOLD",adjustable:"CALL",incorrect:"RAISE / ALL-IN",percentages:{FOLD:54,CALL:42,RAISE:3,"ALL-IN":1}}},
  {match:"MID GAME / ANTE 0.1 BB / BTN VS BB / IP",mix:{correct:"CHECK",adjustable:"BET",incorrect:"RAISE / ALL-IN",percentages:{CHECK:57,BET:38,RAISE:4,"ALL-IN":1}}},
];

function fallback(actions:string[]):Mix{
  const pct:Record<string,number>={};
  const base=Math.floor(100/Math.max(actions.length,1));
  actions.forEach((action,index)=>pct[action]=index===0?base+(100-base*actions.length):base);
  return{correct:actions[0]??"---",adjustable:actions[1]??"---",incorrect:actions.slice(2).join(" / ")||"---",percentages:pct};
}

export default function PlayerDnaAnalysisField(){
  useEffect(()=>{
    const apply=()=>{
      const session=document.querySelector<HTMLElement>(".training-session");
      if(!session)return;
      const headings=[...session.querySelectorAll<HTMLElement>("h4")];
      const section=headings.find(h=>h.textContent?.trim()==="CENÁRIO")?.parentElement as HTMLElement|null
        ?? headings.find(h=>h.textContent?.trim()==="ANÁLISE")?.parentElement as HTMLElement|null;
      if(!section)return;

      const heading=section.querySelector<HTMLElement>("h4");
      if(heading)heading.textContent="ANÁLISE";
      const scenario=section.querySelector<HTMLElement>("div");
      if(!scenario)return;
      const scenarioText=[...scenario.querySelectorAll<HTMLElement>("span")].map(el=>el.textContent?.trim()).filter(Boolean).join(" / ");
      scenario.style.display="none";

      const actionButtons=[...session.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')].filter(btn=>["FOLD","CHECK","CALL","BET","RAISE","ALL-IN"].includes((btn.textContent??"").trim()));
      const actions=[...new Set(actionButtons.map(btn=>(btn.textContent??"").trim()))];
      const selected=actionButtons.find(btn=>btn.getAttribute("aria-pressed")==="true")?.textContent?.trim()??null;
      const mix=MIXES.find(item=>scenarioText.includes(item.match))?.mix??fallback(actions);

      let field=section.querySelector<HTMLElement>("[data-player-dna-analysis]");
      if(!field){field=document.createElement("div");field.dataset.playerDnaAnalysis="true";section.appendChild(field)}
      field.className="player-dna-analysis-field";

      if(!selected){
        field.innerHTML=`<div class="analysis-wait">SELECIONE SUA AÇÃO PARA EXIBIR A ANÁLISE</div>`;
        return;
      }

      const pct=actions.map(action=>`<span><b>${action}</b> ${mix.percentages[action]??0}%</span>`).join("");
      field.innerHTML=`
        <div class="analysis-top">
          <div><strong>AÇÃO CORRETA</strong><span>${mix.correct}</span><small>EV POSITIVO MÁXIMO</small></div>
          <div><strong>AÇÃO AJUSTÁVEL</strong><span>${mix.adjustable}</span><small>EV ZERO OU NEUTRO</small></div>
          <div><strong>AÇÃO INCORRETA</strong><span>${mix.incorrect}</span><small>EV NEGATIVO</small></div>
        </div>
        <div class="analysis-percentages">${pct}</div>`;
    };

    const style=document.createElement("style");
    style.dataset.playerDnaAnalysisStyle="true";
    style.textContent=`
      .player-dna-page .training-session section:has(>h4){overflow:hidden}
      .player-dna-analysis-field{display:grid;gap:8px;width:100%;padding:0;margin:0;color:#ede6db}
      .analysis-top{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
      .analysis-top>div{display:grid;align-content:center;gap:3px;min-width:0;min-height:64px;padding:7px 6px;border:0!important;background:transparent!important;text-align:center}
      .analysis-top strong{font-size:10px;color:#009929;line-height:1.1}
      .analysis-top span{font-size:12px;color:#ede6db;line-height:1.15;white-space:normal}
      .analysis-top small{font-size:8px;color:#82a08e;line-height:1.1}
      .analysis-percentages{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-start;gap:5px 12px;padding:6px 0 2px;border-top:1px solid rgba(37,80,0,.35)}
      .analysis-percentages span{font-size:11px;color:#ede6db;white-space:nowrap}
      .analysis-percentages b{color:#009929;font-weight:400}
      .analysis-wait{padding:10px 0;font-size:11px;color:#82a08e;text-align:left}
      @media(max-width:520px){.analysis-top{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}.analysis-top>div{padding:6px 3px;min-height:70px}.analysis-top strong{font-size:8px}.analysis-top span{font-size:10px}.analysis-top small{font-size:7px}.analysis-percentages{gap:4px 9px}.analysis-percentages span{font-size:10px}}
    `;
    document.head.appendChild(style);
    apply();
    const observer=new MutationObserver(apply);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["aria-pressed"]});
    const timer=window.setInterval(apply,400);
    return()=>{observer.disconnect();window.clearInterval(timer);style.remove()};
  },[]);
  return null;
}
