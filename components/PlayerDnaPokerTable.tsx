"use client";

import { useEffect, useRef } from "react";
import styles from "./PlayerDnaPokerTable.module.css";

const seats = [
  { pos: "MP", cls: "s-mp", chips: "rbk" },
  { pos: "MP+2", cls: "s-mp2", chips: "ryb" },
  { pos: "HJ", cls: "s-hj", chips: "rg" },
  { pos: "CO", cls: "s-co", chips: "yb" },
  { pos: "BTN", cls: "s-btn", chips: "rkb" },
  { pos: "SB", cls: "s-sb", chips: "yp" },
  { pos: "BB", cls: "s-bb", chips: "yb" },
  { pos: "UTG", cls: "s-utg", chips: "rk" },
  { pos: "UTG+1", cls: "s-utg1", chips: "rb" },
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
    <div class="plate"><b>${seat.pos}</b></div>
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
        .scene{position:relative;width:min(100%,448px);aspect-ratio:.67/1;margin:0 auto 58px;font-family:Arial,Helvetica,sans-serif;color:#fff;overflow:visible;filter:drop-shadow(0 18px 28px rgba(0,0,0,.52))}
        .table{position:absolute;inset:5.5% 2.5% 2%;border-radius:49%/16%;background:linear-gradient(180deg,#313437 0%,#111315 12%,#050607 34%,#17191b 69%,#050606 100%);box-shadow:0 22px 38px rgba(0,0,0,.75),inset 0 0 0 2px #44484b,inset 0 0 0 7px #080909,inset 0 -12px 24px rgba(0,0,0,.7)}
        .table:after{content:"";position:absolute;inset:2.2%;border-radius:49%/16%;box-shadow:inset 0 10px 18px rgba(255,255,255,.05),inset 0 -16px 26px rgba(0,0,0,.7);pointer-events:none}
        .table:before{content:"";position:absolute;inset:5.1%;border-radius:48%/16%;background:linear-gradient(90deg,#2c1409 0%,#633117 11%,#8b5734 24%,#3b1e0f 37%,#7a492a 51%,#3b1f11 65%,#885232 80%,#4c2714 91%,#281208 100%);box-shadow:inset 0 0 0 2px #160a05,inset 0 4px 12px rgba(255,255,255,.08),inset 0 -8px 16px rgba(0,0,0,.5),0 0 8px rgba(0,0,0,.55)}
        .felt{position:absolute;inset:10.1%;border-radius:47%/16%;background:radial-gradient(ellipse at 50% 35%,#2c6549 0%,#21563d 38%,#194832 66%,#103021 100%);box-shadow:inset 0 0 72px rgba(0,0,0,.43),inset 0 0 0 1px rgba(255,255,255,.05);overflow:visible}
        .felt:after{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(circle at 50% 18%,rgba(255,255,255,.07),transparent 34%),repeating-linear-gradient(90deg,rgba(255,255,255,.012) 0 1px,transparent 1px 3px);mix-blend-mode:screen;pointer-events:none}
        .betline{position:absolute;inset:10.4% 13.4%;border:2px solid rgba(220,235,226,.34);border-radius:48%/16%}
        .slot{position:absolute;width:33px;height:23px;border:2px solid rgba(220,235,226,.38);border-radius:5px}.sl1{left:45%;top:7%}.sl2{left:22%;top:11%;transform:rotate(-35deg)}.sl3{right:22%;top:11%;transform:rotate(35deg)}.sl4{left:10%;top:24%}.sl5{right:10%;top:24%}.sl6{left:10%;top:57%}.sl7{right:10%;top:57%}.sl8{left:23%;bottom:12%;transform:rotate(35deg)}.sl9{right:23%;bottom:12%;transform:rotate(-35deg)}.sl10{left:45%;bottom:8%}
        .seat{position:absolute;width:74px;text-align:center;z-index:8;transform:translate(-50%,-50%);transition:filter .2s,transform .2s}.seat.active{filter:brightness(1.14);transform:translate(-50%,-50%) scale(1.035)}
        .s-mp{left:50%;top:7%}.s-mp2{left:81%;top:13.4%}.s-hj{left:97%;top:30%}.s-co{left:97.5%;top:58.5%}.s-btn{left:83%;top:86%}.s-sb{left:17%;top:86%}.s-bb{left:2.5%;top:58.5%}.s-utg{left:3%;top:30%}.s-utg1{left:19%;top:13.4%}
        .backs{height:43px;display:flex;justify-content:center;align-items:flex-end;gap:1px;margin-bottom:-4px}.backs span{width:27px;height:40px;border:1px solid #f7f7f4;border-radius:4px;background:#dfe5ea;box-shadow:0 3px 7px rgba(0,0,0,.65);position:relative}.backs span:first-child{transform:rotate(-3deg)}.backs span:last-child{transform:rotate(3deg)}.backs span:after{content:"";position:absolute;inset:3px;border:1px solid #6e829c;background:repeating-linear-gradient(45deg,#68809a 0 2px,#c6d0da 2px 4px)}
        .plate{display:inline-flex;align-items:center;justify-content:center;min-width:58px;min-height:29px;padding:4px 7px;border-radius:8px;background:linear-gradient(#39342f,#141311 56%,#090909);border:2px solid #796852;box-shadow:0 4px 9px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.08);white-space:nowrap}.plate b{font-size:11px;line-height:1;font-weight:900;letter-spacing:.1px}
        .chips{display:flex;justify-content:center;align-items:flex-end;gap:2px;margin-top:5px;height:25px}.chips i,.herochips i{width:15px;height:8px;border-radius:50%;border:1px solid rgba(255,255,255,.82);box-shadow:0 -4px 0 currentColor,0 -8px 0 currentColor,0 -12px 0 currentColor,0 2px 3px rgba(0,0,0,.55),inset 0 0 0 2px rgba(255,255,255,.13)}
        .red{background:#c93c35;color:#c93c35}.blue{background:#2f63aa;color:#2f63aa}.black{background:#2a2a2a;color:#2a2a2a}.green{background:#2e7a58;color:#2e7a58}.yellow{background:#d9ad38;color:#d9ad38}.purple{background:#7045a0;color:#7045a0}
        .pot{position:absolute;left:50%;top:37.5%;transform:translateX(-50%);padding:5px 15px;border-radius:13px;background:linear-gradient(180deg,rgba(23,65,43,.98),rgba(12,42,28,.98));font-weight:900;font-size:17px;box-shadow:0 3px 8px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.08)}
        .board{position:absolute;left:50%;top:46.2%;transform:translateX(-50%);display:flex;gap:5px;z-index:6}.card{width:42px;height:58px;border-radius:5px;background:linear-gradient(#fff,#f1f1ed);color:#111;border:1px solid #d5d5d0;box-shadow:0 3px 8px rgba(0,0,0,.48),inset 0 1px 0 #fff;padding:4px 5px;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start}.card.redc{color:#c62020}.rank{font-size:16px;font-weight:900;line-height:1}.suit{font-size:27px;line-height:1;margin-top:3px;align-self:center}.street{position:absolute;left:50%;top:55.2%;transform:translateX(-50%);color:#c0cdc4;font-weight:800;font-size:10px;letter-spacing:1px}
        .streetTrail{position:absolute;right:19.5%;top:42%;writing-mode:vertical-rl;transform:rotate(180deg);color:rgba(218,231,221,.56);font-size:8px;font-weight:800;letter-spacing:.5px}
        .deck{position:absolute;right:14.5%;top:50.5%;width:48px;height:65px;border:3px solid #080808;border-radius:5px;background:linear-gradient(#202224,#111214);box-shadow:0 5px 11px rgba(0,0,0,.62),inset 0 0 0 1px #35383a;z-index:5}.deck:before{content:"";position:absolute;left:7px;right:7px;top:7px;height:38px;border:1px solid #f3f3f0;background:repeating-linear-gradient(45deg,#68809a 0 2px,#c6d0da 2px 4px)}.deck:after{content:"";position:absolute;left:6px;right:6px;bottom:6px;height:4px;background:#3c3d3f;box-shadow:0 -7px #343638,0 -14px #2b2d2f}
        .dealer{position:absolute;right:25%;bottom:17.2%;display:block;color:#f1f1ec;font-size:11px;font-weight:900;text-shadow:0 1px 3px #000;z-index:6}
        .herochips{position:absolute;left:50%;bottom:13.7%;transform:translateX(-50%);display:flex;gap:3px;z-index:7;height:25px;align-items:flex-end}.herostack{position:absolute;left:50%;bottom:10%;transform:translateX(-50%);font-size:15px;font-weight:900;text-shadow:0 2px 4px #000;z-index:7}
        .herocards{position:absolute;left:50%;bottom:-1%;transform:translateX(-50%);display:flex;gap:2px;z-index:9}.herocards .card{width:44px;height:62px}.herocards .card:first-child{transform:rotate(-3deg)}.herocards .card:last-child{transform:rotate(3deg)}.heroplate{position:absolute;left:50%;bottom:-10.2%;transform:translateX(-50%);z-index:10;min-width:132px;padding:8px 12px;border-radius:10px;background:linear-gradient(#c94631,#8b190f 52%,#640d08);border:2px solid #d6a24f;box-shadow:0 5px 12px rgba(0,0,0,.64),0 0 14px rgba(185,44,31,.22),inset 0 1px 0 rgba(255,255,255,.16);text-align:center}.heroplate b{display:block;font-size:16px}.heroplate small{display:block;font-size:9px;color:#f4d8d0;margin-top:2px;text-transform:none}
        .action{position:absolute;left:50%;top:77px;transform:translateX(-50%);background:linear-gradient(#fff,#e7ece7);color:#173324;border-radius:999px;padding:2px 7px;font-size:7px;font-weight:900;box-shadow:0 2px 5px rgba(0,0,0,.45)}
        @media(max-width:390px){.scene{width:100%}.seat{width:68px}.plate{min-width:54px;min-height:27px;padding:4px 6px}.plate b{font-size:10px}.backs span{width:23px;height:34px}.board .card{width:37px;height:52px}.suit{font-size:23px}.deck{width:43px;height:58px}.streetTrail{right:18.5%}}
      </style>
      <div class="scene">
        <div class="table"><div class="felt">
          <div class="betline"></div>
          <span class="slot sl1"></span><span class="slot sl2"></span><span class="slot sl3"></span><span class="slot sl4"></span><span class="slot sl5"></span><span class="slot sl6"></span><span class="slot sl7"></span><span class="slot sl8"></span><span class="slot sl9"></span><span class="slot sl10"></span>
          ${seats.map(seatMarkup).join("")}
          <div class="pot">$385</div>
          <div class="board"><div class="card redc"><span class="rank">8</span><span class="suit">♦</span></div><div class="card redc"><span class="rank">J</span><span class="suit">♥</span></div><div class="card"><span class="rank">4</span><span class="suit">♣</span></div></div>
          <div class="street">FLOP</div><div class="streetTrail">FLOP / TURN / RIVER</div><div class="deck"></div><div class="dealer">D</div>
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
