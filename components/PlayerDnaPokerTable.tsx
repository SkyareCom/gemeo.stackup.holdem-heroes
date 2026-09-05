"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./PlayerDnaPokerTable.module.css";

const seats = [
  { pos: "MP", sub: "Middle Position", x: 250, y: 88 },
  { pos: "MP+2", sub: "", x: 374, y: 125 },
  { pos: "HJ", sub: "Hijack", x: 425, y: 238 },
  { pos: "CO", sub: "Cutoff", x: 430, y: 420 },
  { pos: "BTN", sub: "Button", x: 378, y: 605 },
  { pos: "SB", sub: "Small Blind", x: 125, y: 605 },
  { pos: "BB", sub: "Big Blind", x: 72, y: 420 },
  { pos: "UTG", sub: "Under the Gun", x: 75, y: 238 },
  { pos: "UTG+1", sub: "", x: 127, y: 125 },
];

const backPatternId = "dna-card-back";

function CardBack({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x="-19" y="-28" width="38" height="56" rx="4" fill="#f5f5f3" stroke="#d7d7d2" strokeWidth="1.2" />
      <rect x="-15" y="-24" width="30" height="48" rx="2.5" fill={`url(#${backPatternId})`} stroke="#7386a0" strokeWidth="1" />
    </g>
  );
}

function ChipStack({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const chips = [
    [0, 0, "#cb4238"], [14, -2, "#2f63aa"], [28, 0, "#232323"],
    [0, -8, "#cb4238"], [14, -10, "#2f63aa"], [28, -8, "#232323"],
    [0, -16, "#cb4238"], [14, -18, "#2f63aa"], [28, -16, "#232323"],
  ] as const;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {chips.map(([cx, cy, fill], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}>
          <ellipse cx="0" cy="0" rx="7" ry="3.6" fill={fill} stroke="#eee" strokeWidth="1" />
          <path d="M-5 -1.2 L-1 -3 M5 -1.2 L1 -3 M-5 1.2 L-1 3 M5 1.2 L1 3" stroke="#fff" strokeWidth="0.9" opacity=".85" />
        </g>
      ))}
    </g>
  );
}

function Seat({ pos, sub, x, y, active }: { pos: string; sub: string; x: number; y: number; active: boolean }) {
  return (
    <g className={active ? styles.activeSeat : undefined}>
      <g transform={`translate(${x} ${y - 35})`}>
        <CardBack x={-12} y={0} rotate={-3} />
        <CardBack x={12} y={0} rotate={3} />
      </g>
      <g transform={`translate(${x} ${y})`}>
        <rect x="-48" y="-20" width="96" height="40" rx="8" fill="#171615" stroke={active ? "#f0eadc" : "#7f705c"} strokeWidth={active ? 2.6 : 2} />
        <rect x="-44" y="-16" width="88" height="32" rx="6" fill="url(#plateGrad)" opacity=".98" />
        <text x="0" y={sub ? -1 : 6} textAnchor="middle" fill="#f7f7f5" fontSize="18" fontWeight="800">{pos}</text>
        {sub && <text x="0" y="13" textAnchor="middle" fill="#c9c3b8" fontSize="9.5">({sub})</text>}
      </g>
      <ChipStack x={x - 15} y={y + 40} scale={0.72} />
    </g>
  );
}

export default function PlayerDnaPokerTable() {
  const [actor, setActor] = useState(0);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const actorTimer = window.setInterval(() => setActor((v) => (v + 1) % seats.length), 1200);
    const pulseTimer = window.setInterval(() => setPulse((v) => (v + 1) % 1000), 900);
    return () => {
      window.clearInterval(actorTimer);
      window.clearInterval(pulseTimer);
    };
  }, []);

  const activeSeat = useMemo(() => seats[actor], [actor]);

  return (
    <section className={styles.stage} aria-label="Mesa de poker animada Player DNA">
      <div className={styles.tableWrap}>
        <svg viewBox="0 0 500 760" role="img" aria-label="Mesa de poker oval com dez posições">
          <defs>
            <linearGradient id="outerRail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2a2d2f" />
              <stop offset=".35" stopColor="#0d0e0f" />
              <stop offset=".7" stopColor="#1c1e20" />
              <stop offset="1" stopColor="#050606" />
            </linearGradient>
            <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#2c160d" />
              <stop offset=".2" stopColor="#78472a" />
              <stop offset=".5" stopColor="#3e2114" />
              <stop offset=".8" stopColor="#7d4b2b" />
              <stop offset="1" stopColor="#2d170e" />
            </linearGradient>
            <radialGradient id="felt" cx="50%" cy="42%" r="65%">
              <stop offset="0" stopColor="#2b6548" />
              <stop offset=".52" stopColor="#1f533a" />
              <stop offset="1" stopColor="#123426" />
            </radialGradient>
            <linearGradient id="plateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#332f2b" />
              <stop offset="1" stopColor="#11100f" />
            </linearGradient>
            <pattern id={backPatternId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill="#9eb0c5" />
              <path d="M0 0 L0 6" stroke="#6f849f" strokeWidth="2" />
              <path d="M3 0 L3 6" stroke="#d4dde6" strokeWidth="1" opacity=".9" />
            </pattern>
            <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity=".58" />
            </filter>
            <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f1eadc" floodOpacity=".65" />
            </filter>
          </defs>

          <ellipse cx="250" cy="380" rx="226" ry="335" fill="url(#outerRail)" filter="url(#shadow)" />
          <ellipse cx="250" cy="380" rx="203" ry="311" fill="url(#wood)" stroke="#1a0c07" strokeWidth="3" />
          <ellipse cx="250" cy="380" rx="184" ry="290" fill="url(#felt)" stroke="#0f281d" strokeWidth="2" />
          <ellipse cx="250" cy="382" rx="132" ry="236" fill="none" stroke="#b7c8bb" strokeOpacity=".5" strokeWidth="2" />

          <g opacity=".55" stroke="#c7d5cb" fill="none" strokeWidth="2">
            <rect x="237" y="149" width="26" height="23" rx="4" />
            <rect x="134" y="168" width="34" height="22" rx="4" transform="rotate(-34 151 179)" />
            <rect x="335" y="168" width="34" height="22" rx="4" transform="rotate(34 352 179)" />
            <rect x="110" y="247" width="34" height="24" rx="4" />
            <rect x="357" y="247" width="34" height="24" rx="4" />
            <rect x="110" y="445" width="34" height="24" rx="4" />
            <rect x="357" y="445" width="34" height="24" rx="4" />
            <rect x="136" y="548" width="34" height="22" rx="4" transform="rotate(34 153 559)" />
            <rect x="333" y="548" width="34" height="22" rx="4" transform="rotate(-34 350 559)" />
            <rect x="237" y="584" width="26" height="23" rx="4" />
          </g>

          {seats.map((seat, index) => <Seat key={seat.pos} {...seat} active={actor === index} />)}

          <g>
            <rect x="211" y="294" width="78" height="33" rx="16" fill="#173c2a" opacity=".94" />
            <text x="250" y="317" textAnchor="middle" fill="#fff" fontSize="21" fontWeight="800">$385</text>
          </g>

          <g transform="translate(250 365)">
            {[
              { x: -64, rank: "8", suit: "♦", red: true },
              { x: -20, rank: "J", suit: "♥", red: true },
              { x: 24, rank: "4", suit: "♣", red: false },
            ].map((c) => (
              <g key={c.rank} transform={`translate(${c.x} 0)`}>
                <rect x="0" y="0" width="40" height="58" rx="4" fill="#f8f8f6" stroke="#d6d6d1" />
                <text x="7" y="18" fill={c.red ? "#c92727" : "#111"} fontSize="15" fontWeight="800">{c.rank}</text>
                <text x="20" y="44" textAnchor="middle" fill={c.red ? "#c92727" : "#111"} fontSize="28">{c.suit}</text>
              </g>
            ))}
            <text x="0" y="82" textAnchor="middle" fill="#c1d0c5" fontSize="16" fontWeight="700">FLOP</text>
          </g>

          <g transform="translate(370 360)">
            <rect x="0" y="0" width="58" height="76" rx="5" fill="#161819" stroke="#060606" strokeWidth="4" />
            <rect x="8" y="7" width="42" height="54" rx="3" fill="#242729" />
            <CardBack x={29} y={29} />
            <path d="M8 66 H50 M8 70 H50 M8 74 H50" stroke="#47494c" strokeWidth="2" />
          </g>

          <g transform="translate(326 520)">
            <circle cx="0" cy="0" r="17" fill="#f0f0ec" stroke="#a7a7a2" strokeWidth="2" />
            <text x="0" y="4" textAnchor="middle" fill="#222" fontSize="7.5" fontWeight="800">BUTTON</text>
          </g>

          <g transform="translate(250 607)">
            <ChipStack x={-20} y={0} scale={1.05} />
            <rect x="-40" y="15" width="80" height="31" rx="15" fill="#101812" opacity=".95" />
            <text x="0" y="38" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="800">$250</text>
          </g>

          <g transform="translate(250 676)">
            <g transform="translate(-22 0) rotate(-4)">
              <rect x="-19" y="-31" width="38" height="62" rx="4" fill="#fff" stroke="#ddd" />
              <text x="-10" y="-11" fill="#111" fontSize="17" fontWeight="800">A</text>
              <text x="0" y="14" textAnchor="middle" fill="#111" fontSize="30">♠</text>
            </g>
            <g transform="translate(22 0) rotate(4)">
              <rect x="-19" y="-31" width="38" height="62" rx="4" fill="#fff" stroke="#ddd" />
              <text x="-10" y="-11" fill="#c72626" fontSize="17" fontWeight="800">K</text>
              <text x="0" y="14" textAnchor="middle" fill="#c72626" fontSize="30">♥</text>
            </g>
            <g transform="translate(0 48)" filter={pulse % 2 === 0 ? "url(#glow)" : undefined}>
              <rect x="-72" y="-23" width="144" height="46" rx="9" fill="url(#heroGrad)" stroke="#d9b15a" strokeWidth="3" />
              <text x="0" y="-1" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="900">HERO</text>
              <text x="0" y="16" textAnchor="middle" fill="#f5ddd6" fontSize="11">(You)</text>
            </g>
          </g>

          <defs>
            <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c7422e"/><stop offset="1" stopColor="#6f0f09"/></linearGradient>
          </defs>

          <g className={styles.actionBadge} transform={`translate(${activeSeat.x} ${activeSeat.y + 71})`}>
            <rect x="-28" y="-10" width="56" height="20" rx="10" fill="#eef3ee" />
            <text x="0" y="4" textAnchor="middle" fill="#173524" fontSize="8" fontWeight="900">AÇÃO</text>
          </g>
        </svg>
      </div>
    </section>
  );
}
