"use client";

import { useEffect, useRef } from "react";
import styles from "./PlayerDnaPokerTable.module.css";

const seats = [
  { pos: "MP", sub: "Middle Position", cls: "s-mp", chips: "rbk" },
  { pos: "MP+2", sub: "", cls: "s-mp2", chips: "ryb" },
  { pos: "HJ", sub: "Hijack", cls: "s-hj", chips: "rg" },
  { pos: "CO", sub: "Cutoff", cls: "s-co", chips: "yb" },
  { pos: "BTN", sub: "Button", cls: "s-btn", chips: "rkb" },
  { pos: "SB", sub: "Small Blind", cls: "s-sb", chips: "yp" },
  { pos: "BB", sub: "Big Blind", cls: "s-bb", chips: "yb" },
  { pos: "UTG", sub: "Under the Gun", cls: "s-utg", chips: "rk" },
  { pos: "UTG+1", sub: "", cls: "s-utg1", chips: "rb" },
];

function seatMarkup(seat: (typeof seats)[number], index: number) {
  const chipColors: Record<string, string[]> = {
    rbk: ["red", "blue", "black"], ryb: ["red", "yellow", "blue"], rg: ["red", "green"],
    yb: ["yellow", "blue"], rkb: ["red", "black", "blue"], yp: ["yellow", "purple"],
    rk: ["red", "black"], rb: ["red", "blue"],
  };
  const chips = chipColors[seat.chips] || ["red", "blue"];
  return `<div class="seat ${seat.cls}" data-seat="${index}">
    <div class="backs"><span></span><span></span></div>
    <div class="plate"><b>${seat.pos}</b>${seat.sub ? `<small>(${seat.sub})</small>` : ""}</div>
    <div class="chips">${chips.map((c) => `<i class="${c}"></i>`).join("")}</div>
  </div>`;
}

export default function PlayerDnaPokerTable() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });

    root.innerHTML = `
      <style>
        :host{display:block;width:100%;contain:content}
        *{box-sizing:border-box}
        .scene{position:relative;width:min(100%,430px);aspect-ratio:0.64/1;margin:0 auto 56px;font-family:Arial,Helvetica,sans-serif;color:#fff;overflow:visible}
        .table{position:absolute;inset:7% 4% 2%;border-radius:48%/15%;background:linear-gradient(180deg,#242729 0%,#0d0e10 16%,#1d1f21 56%,#070809 100%);box-shadow:0 24px 42px rgba(0,0,0,.72),inset 0 0 0 2px #3c3e40,inset 0 0 0 9px #070808}
        .table:before{content:"";position:absolute;inset:5.2%;border-radius:48%/15%;background:linear-gradient(90deg,#2f160b 0%,#6c371d 16%,#3d1f10 34%,#7c4527 52%,#402113 70%,#734121 86%,#2c160c 100%);box-shadow:inset 0 0 0 2px #160a06,inset 0 0 20px rgba(0,0,0,.72),0 0 10px rgba(0,0,0,.6)}
        .felt{position:absolute;inset:10.2%;border-radius:47%/15%;background:radial-gradient(ellipse at 50% 43%,#315d47 0%,#1f4d38 48%,#123326 100%);box-shadow:inset 0 0 64px rgba(0,0,0,.48),inset 0 0 0 1px rgba(255,255,255,.05)}
        .betline{position:absolute;inset:10% 13%;border:2px solid rgba(220,235,226,.38);border-radius:48%/15%}
        .slot{position:absolute;width:34px;height:24px;border:2px solid rgba(220,235,226,.42);border-radius:5px}.sl1{left:45%;top:7%}.sl2{left:22%;top:11%;transform:rotate(-35deg)}.sl3{right:22%;top:11%;transform:rotate(35deg)}.sl4{left:10%;top:24%}.sl5{right:10%;top:24%}.sl6{left:10%;top:57%}.sl7{right:10%;top:57%}.sl8{left:23%;bottom:12%;transform:rotate(35deg)}.sl9{right:23%;bottom:12%;transform:rotate(-35deg)}.sl10{left:45%;bottom:8%}
        .seat{position:absolute;width:88px;text-align:center;z-index:8;transform:translate(-50%,-50%);transition:filter .2s,transform .2s}.seat.active{filter:brightness(1.2);transform:translate(-50%,-50%) scale(1.04)}
        .s-mp{left:50%;top:8%}.s-mp2{left:78%;top:12%}.s-hj{left:94%;top:28%}.s-co{left:95%;top:56%}.s-btn{left:80%;top:84%}.s-sb{left:20%;top:84%}.s-bb{left:5%;top:56%}.s-utg{left:6%;top:28%}.s-utg1{left:22%;top:12%}
        .backs{height:42px;display:flex;justify-content:center;align-items:flex-end;gap:2px;margin-bottom:-5px}.backs span{width:28px;height:40px;border:1px solid #f6f6f3;border-radius:4px;background:#dfe5ea;box-shadow:0 3px 7px rgba(0,0,0,.65);position:relative}.backs span:after{content:"";position:absolute;inset:3px;border:1px solid #6e829c;background:repeating-linear-gradient(45deg,#6d829d 0 2px,#c3ced9 2px 4px)}
        .plate{display:inline-flex;flex-direction:column;align-items:center;min-width:74px;padding:5px 8px 4px;border-radius:8px;background:linear-gradient(#36322d,#11110f);border:2px solid #766650;box-shadow:0 4px 9px rgba(0,0,0,.7);white-space:nowrap}.plate b{font-size:15px;line-height:1;font-weight:800}.plate small{font-size:8px;line-height:1;margin-top:3px;color:#cfc8bc;text-transform:none}
        .chips{display:flex;justify-content:center;align-items:flex-end;gap:2px;margin-top:4px;height:25px}.chips i,.herochips i{width:16px;height:9px;border-radius:50%;border:1px solid rgba(255,255,255,.8);box-shadow:0 -4px 0 currentColor,0 -8px 0 currentColor,0 -12px 0 currentColor,0 2px 3px rgba(0,0,0,.55)}
        .red{background:#c93c35;color:#c93c35}.blue{background:#2f63aa;color:#2f63aa}.black{background:#2a2a2a;color:#2a2a2a}.green{background:#2e7a58;color:#2e7a58}.yellow{background:#d9ad38;color:#d9ad38}.purple{background:#7045a0;color:#7045a0}
        .pot{position:absolute;left:50%;top:38%;transform:translateX(-50%);padding:5px 15px;border-radius:12px;background:rgba(20,58,40,.94);font-weight:800;font-size:17px;box-shadow:0 3px 8px rgba(0,0,0,.4)}
        .board{position:absolute;left:50%;top:46%;transform:translateX(-50%);display:flex;gap:6px;z-index:6}.card{width:43px;height:58px;border-radius:5px;background:#fafaf8;color:#111;border:1px solid #ddd;box-shadow:0 3px 8px rgba(0,0,0,.5);padding:4px 5px;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start}.card.redc{color:#c62020}.rank{font-size:16px;font-weight:800;line-height:1}.suit{font-size:28px;line-height:1;margin-top:3px;align-self:center}.street{position:absolute;left:50%;top:55.5%;transform:translateX(-50%);color:#c0cdc4;font-weight:800;font-size:10px;letter-spacing:1px}
        .deck{position:absolute;right:15%;top:50%;width:50px;height:66px;border:3px solid #080808;border-radius:5px;background:#191a1b;box-shadow:0 5px 11px rgba(0,0,0,.6);z-index:5}.deck:before{content:"";position:absolute;left:7px;right:7px;top:7px;height:38px;border:1px solid #f3f3f0;background:repeating-linear-gradient(45deg,#6d829d 0 2px,#c3ced9 2px 4px)}.deck:after{content:"";position:absolute;left:6px;right:6px;bottom:6px;height:4px;background:#3c3d3f;box-shadow:0 -7px #343638,0 -14px #2b2d2f}
        .dealer{position:absolute;right:25%;bottom:17%;width:31px;height:31px;border-radius:50%;display:grid;place-items:center;background:#efefe9;color:#202020;border:2px solid #a8a8a2;font-size:7px;font-weight:800;box-shadow:0 2px 5px rgba(0,0,0,.45);z-index:6}
        .herochips{position:absolute;left:50%;bottom:13.5%;transform:translateX(-50%);display:flex;gap:3px;z-index:7;height:25px;align-items:flex-end}.herostack{position:absolute;left:50%;bottom:10%;transform:translateX(-50%);font-size:15px;font-weight:800;text-shadow:0 2px 4px #000;z-index:7}
        .herocards{position:absolute;left:50%;bottom:-1%;transform:translateX(-50%);display:flex;gap:4px;z-index:9}.herocards .card{width:44px;height:62px}.heroplate{position:absolute;left:50%;bottom:-10%;transform:translateX(-50%);z-index:10;min-width:132px;padding:7px 12px;border-radius:10px;background:linear-gradient(#bc3b2b,#700f09);border:2px solid #d6a24f;box-shadow:0 5px 12px rgba(0,0,0,.64);text-align:center}.heroplate b{display:block;font-size:16px}.heroplate small{display:block;font-size:9px;color:#f4d8d0;margin-top:2px;text-transform:none}
        .action{position:absolute;left:50%;top:76px;transform:translateX(-50%);background:#f0f2ed;color:#173324;border-radius:999px;padding:2px 7px;font-size:7px;font-weight:800;box-shadow:0 2px 5px rgba(0,0,0,.45)}
        @media(max-width:390px){.scene{width:100%;}.seat{width:78px}.plate{min-width:66px}.plate b{font-size:13px}.backs span{width:25px;height:36px}.board .card{width:38px;height:53px}.suit{font-size:24px}.deck{width:44px;height:59px}}
      </style>
      <div class="scene">
        <div class="table"><div class="felt">
          <div class="betline"></div>
          <span class="slot sl1"></span><span class="slot sl2"></span><span class="slot sl3"></span><span class="slot sl4"></span><span class="slot sl5"></span><span class="slot sl6"></span><span class="slot sl7"></span><span class="slot sl8"></span><span class="slot sl9"></span><span class="slot sl10"></span>
          ${seats.map(seatMarkup).join("")}
          <div class="pot">$385</div>
          <div class="board"><div class="card redc"><span class="rank">8</span><span class="suit">♦</span></div><div class="card redc"><span class="rank">J</span><span class="suit">♥</span></div><div class="card"><span class="rank">4</span><span class="suit">♣</span></div></div>
          <div class="street">FLOP</div><div class="deck"></div><div class="dealer">BUTTON</div>
          <div class="herochips"><i class="red"></i><i class="blue"></i><i class="black"></i></div><div class="herostack">$250</div>
          <div class="herocards"><div class="card"><span class="rank">A</span><span class="suit">♠</span></div><div class="card redc"><span class="rank">K</span><span class="suit">♥</span></div></div>
          <div class="heroplate"><b>HERO</b><small>(You)</small></div>
        </div></div>
      </div>`;

    let actor = 0;
    const updateActor = () => {
      root.querySelectorAll<HTMLElement>(".seat").forEach((el, i) => {
        el.classList.toggle("active", i === actor);
        el.querySelector(".action")?.remove();
      });
      const active = root.querySelector<HTMLElement>(`.seat[data-seat="${actor}"]`);
      if (active) {
        const badge = document.createElement("div");
        badge.className = "action";
        badge.textContent = ["CALL", "FOLD", "CHECK", "RAISE", "FOLD", "CALL", "CHECK", "RAISE", "CALL"][actor];
        active.appendChild(badge);
      }
      actor = (actor + 1) % seats.length;
    };
    updateActor();
    const timer = window.setInterval(updateActor, 1150);
    return () => window.clearInterval(timer);
  }, []);

  return <div ref={hostRef} className={styles.host} aria-label="Mesa de poker animada Player DNA" />;
}
