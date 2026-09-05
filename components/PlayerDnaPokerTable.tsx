"use client";

import {useEffect,useRef} from "react";
import type {PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";
import styles from "./PlayerDnaPokerTable.module.css";

type Props={
  spot:PlayerDnaSpot;
  selectedAction:PlayerAction|null;
  onSequenceReady:(ready:boolean)=>void;
};

const seatClasses=["s-mp","s-mp2","s-hj","s-co","s-btn","s-sb","s-bb","s-utg","s-utg1"];

function esc(value:string){return value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char]??char))}
function cardMarkup(card:string){const rank=esc(card.slice(0,-1));const suit=esc(card.slice(-1));const red=suit==="♥"||suit==="♦";return `<div class="card${red?" redc":""}"><span class="rank">${rank}</span><span class="suit">${suit}</span></div>`}
function stackLabel(value:number){return `${Number.isInteger(value)?value:value.toFixed(1)} BB`}

export default function PlayerDnaPokerTable({spot,selectedAction,onSequenceReady}:Props){
  const hostRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const host=hostRef.current;
    if(!host)return;
    const root=host.shadowRoot??host.attachShadow({mode:"open"});
    const hero=spot.players.find(player=>player.hero)??spot.players[0];
    const opponents=spot.players.filter(player=>!player.hero).slice(0,seatClasses.length);
    const board=(spot.board??"").split(" ").filter(Boolean);
    const heroCards=spot.heroCards.split(" ").filter(Boolean);
    const sideTotal=(spot.pot.sides??[]).reduce((sum,pot)=>sum+pot.value,0);

    const seats=opponents.map((player,index)=>`<div class="seat ${seatClasses[index]}" data-seat="${index}">
      <div class="backs"><span></span><span></span></div>
      <div class="plate"><b>${esc(player.position)}</b></div>
      <div class="stack">${stackLabel(player.stack)}</div>
    </div>`).join("");

    root.innerHTML=`
      <style>
        :host{display:block;width:100%;contain:content}
        *{box-sizing:border-box}
        .scene{position:relative;width:min(100%,448px);aspect-ratio:.67/1;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#fff;overflow:visible;filter:drop-shadow(0 16px 24px rgba(0,0,0,.46))}
        .table{position:absolute;inset:5.5% 2.5% 2%;border-radius:49%/16%;background:linear-gradient(180deg,#313437 0%,#111315 12%,#050607 34%,#17191b 69%,#050606 100%);box-shadow:0 22px 38px rgba(0,0,0,.75),inset 0 0 0 2px #44484b,inset 0 0 0 7px #080909}
        .table:after{content:"";position:absolute;inset:2.2%;border-radius:49%/16%;box-shadow:inset 0 10px 18px rgba(255,255,255,.04),inset 0 -16px 26px rgba(0,0,0,.65);pointer-events:none}
        .table:before{content:"";position:absolute;inset:5.1%;border-radius:48%/16%;background:linear-gradient(90deg,#2c1409,#71401f 23%,#3b1e0f 40%,#7a492a 55%,#3b1f11 72%,#71401f 88%,#281208);box-shadow:inset 0 0 0 2px #160a05,inset 0 3px 9px rgba(255,255,255,.07),inset 0 -8px 16px rgba(0,0,0,.5)}
        .felt{position:absolute;inset:10.1%;border-radius:47%/16%;background:radial-gradient(ellipse at 50% 35%,#2b6247 0%,#20533b 42%,#17442f 70%,#102f21 100%);box-shadow:inset 0 0 66px rgba(0,0,0,.4),inset 0 0 0 1px rgba(255,255,255,.04);overflow:visible}
        .betline{position:absolute;inset:11% 14%;border:1px solid rgba(220,235,226,.23);border-radius:48%/16%}
        .seat{position:absolute;width:60px;text-align:center;z-index:8;transform:translate(-50%,-50%);transition:filter .2s,transform .2s,opacity .25s}.seat.active{filter:brightness(1.16);transform:translate(-50%,-50%) scale(1.04)}.seat.folded{opacity:.34}
        .s-mp{left:50%;top:6.5%}.s-mp2{left:82%;top:13%}.s-hj{left:98%;top:30%}.s-co{left:98.5%;top:59%}.s-btn{left:84%;top:87%}.s-sb{left:16%;top:87%}.s-bb{left:1.5%;top:59%}.s-utg{left:2%;top:30%}.s-utg1{left:18%;top:13%}
        .backs{height:34px;display:flex;justify-content:center;align-items:flex-end;gap:1px;margin-bottom:-3px}.backs span{width:21px;height:31px;border:1px solid #f7f7f4;border-radius:3px;background:#dfe5ea;box-shadow:0 2px 5px rgba(0,0,0,.55);position:relative}.backs span:first-child{transform:rotate(-3deg)}.backs span:last-child{transform:rotate(3deg)}.backs span:after{content:"";position:absolute;inset:3px;border:1px solid #72849a;background:repeating-linear-gradient(45deg,#68809a 0 2px,#c6d0da 2px 4px)}
        .plate{display:inline-flex;align-items:center;justify-content:center;min-width:48px;min-height:23px;padding:3px 5px;border-radius:6px;background:linear-gradient(#34302c,#111);border:1px solid #71614d;box-shadow:0 3px 6px rgba(0,0,0,.58);white-space:nowrap}.plate b{font-size:9px;line-height:1;font-weight:900}.stack{margin-top:2px;font-size:8px;line-height:1;font-weight:900;color:#fff;text-shadow:0 1px 3px #000;white-space:nowrap}
        .pot{position:absolute;left:50%;top:36%;transform:translateX(-50%);padding:4px 10px;border-radius:10px;background:rgba(14,50,33,.9);font-weight:900;font-size:12px;box-shadow:0 2px 5px rgba(0,0,0,.32);white-space:nowrap}.sidepot{position:absolute;left:50%;top:41%;transform:translateX(-50%);font-size:8px;font-weight:900;opacity:.84;white-space:nowrap}
        .board{position:absolute;left:50%;top:47%;transform:translateX(-50%);display:flex;gap:3px;z-index:6}.card{width:37px;height:52px;border-radius:5px;background:linear-gradient(#fff,#f1f1ed);color:#111;border:1px solid #d5d5d0;box-shadow:0 3px 7px rgba(0,0,0,.42);padding:4px;display:flex;flex-direction:column;align-items:flex-start}.card.redc{color:#c62020}.rank{font-size:14px;font-weight:900;line-height:1}.suit{font-size:22px;line-height:1;margin-top:3px;align-self:center}.street{position:absolute;left:50%;top:56%;transform:translateX(-50%);color:#b8c6bc;font-weight:800;font-size:9px;letter-spacing:1px}
        .heroaction{position:absolute;left:50%;bottom:21%;transform:translateX(-50%);padding:3px 8px;border-radius:999px;background:#edf0eb;color:#173324;font-size:8px;font-weight:900;z-index:12;white-space:nowrap}
        .herostack{position:absolute;left:50%;bottom:10.5%;transform:translateX(-50%);font-size:10px;font-weight:900;text-shadow:0 2px 4px #000;z-index:7}.herocards{position:absolute;left:50%;bottom:-.5%;transform:translateX(-50%);display:flex;gap:2px;z-index:9}.herocards .card{width:41px;height:57px}.herocards .card:first-child{transform:rotate(-3deg)}.herocards .card:last-child{transform:rotate(3deg)}.heroplate{position:absolute;left:50%;bottom:-8.7%;transform:translateX(-50%);z-index:10;min-width:104px;padding:6px 10px;border-radius:8px;background:linear-gradient(#c94631,#7d130b);border:1px solid #c89446;box-shadow:0 4px 9px rgba(0,0,0,.58);text-align:center}.heroplate b{display:block;font-size:13px}.heroplate small{display:block;font-size:8px;font-weight:900;color:#f4d8d0;margin-top:2px}
        .action{position:absolute;left:50%;top:69px;transform:translateX(-50%);background:#edf0eb;color:#173324;border-radius:999px;padding:2px 6px;font-size:7px;font-weight:900;box-shadow:0 2px 4px rgba(0,0,0,.35);white-space:nowrap}
        @media(max-width:390px){.seat{width:54px}.plate{min-width:43px;min-height:21px;padding:3px 4px}.plate b{font-size:8px}.stack{font-size:7px}.backs{height:31px}.backs span{width:19px;height:28px}.board .card{width:34px;height:48px}.suit{font-size:20px}.pot{font-size:11px}}
      </style>
      <div class="scene"><div class="table"><div class="felt">
        <div class="betline"></div>${seats}
        <div class="pot">POT ${stackLabel(spot.pot.main)}</div>
        ${sideTotal>0?`<div class="sidepot">SIDE POT ${stackLabel(sideTotal)}</div>`:""}
        <div class="board">${board.map(cardMarkup).join("")}</div>
        <div class="street">${esc(spot.street)}</div>
        <div class="heroaction">${selectedAction?esc(selectedAction):"SUA AÇÃO"}</div>
        <div class="herostack">${stackLabel(hero.stack)}</div>
        <div class="herocards">${heroCards.map(cardMarkup).join("")}</div>
        <div class="heroplate"><b>HERO · ${esc(hero.position)}</b><small>${stackLabel(hero.stack)}</small></div>
      </div></div></div>`;

    onSequenceReady(false);
    const timers:number[]=[];
    const clearBadges=()=>root.querySelectorAll<HTMLElement>(".seat").forEach(el=>{el.classList.remove("active");el.querySelector(".action")?.remove()});
    const play=(step:number)=>{
      clearBadges();
      if(step>=opponents.length){onSequenceReady(true);return}
      const player=opponents[step];
      const seat=root.querySelector<HTMLElement>(`.seat[data-seat="${step}"]`);
      if(seat){
        seat.classList.add("active");
        const badge=document.createElement("div");badge.className="action";badge.textContent=player.action;seat.appendChild(badge);
        if(player.action==="FOLD")timers.push(window.setTimeout(()=>seat.classList.add("folded"),620));
      }
      timers.push(window.setTimeout(()=>play(step+1),1000));
    };
    timers.push(window.setTimeout(()=>play(0),250));
    return()=>timers.forEach(timer=>window.clearTimeout(timer));
  },[spot,selectedAction,onSequenceReady]);

  return <div ref={hostRef} className={styles.host} aria-label="Mesa de poker animada Player DNA"/>;
}
