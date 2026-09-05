"use client";

import {useEffect,useMemo,useState} from "react";

export type SharedPokerTableProps={
  villain?:string;
  hero?:string;
  board?:string[];
  pot?:string|number;
};

const seatOrder=["UTG","UTG+1","MP","MP+1","HJ","CO","BTN","SB","BB"] as const;
const seatClass=["s1","s2","s3","s4","s5","s6","s7","s8","s9"] as const;

function extractPosition(label:string){
  const upper=label.toUpperCase();
  return seatOrder.find(position=>upper.includes(position))??"BTN";
}

function extractHeroCards(label:string){
  const parts=label.split("·").map(part=>part.trim());
  return parts.at(-1)?.includes(" ")?parts.at(-1)!.split(" ").filter(Boolean):[];
}

export default function SharedPokerTable({villain="VILLAIN · CO",hero="HERO · BTN · A♦ K♦",board=["A♠","7♥","2♣"],pot="—"}:SharedPokerTableProps){
  const heroPosition=useMemo(()=>extractPosition(hero),[hero]);
  const villainPosition=useMemo(()=>extractPosition(villain),[villain]);
  const heroCards=useMemo(()=>extractHeroCards(hero),[hero]);
  const tableCards=[...board];while(tableCards.length<5)tableCards.push("?");
  const[step,setStep]=useState(0);

  useEffect(()=>{
    setStep(0);
    const timers=[650,1350,2100,2850].map((delay,index)=>window.setTimeout(()=>setStep(index+1),delay));
    return()=>timers.forEach(window.clearTimeout);
  },[hero,villain,board.join("|"),pot]);

  const activePosition=step<2?villainPosition:heroPosition;
  const visibleBoard=step===0?0:step===1?Math.min(3,board.length):step===2?Math.min(4,board.length):board.length;

  return <div className="animated-table-shell" aria-label="Mesa de poker animada do spot">
    <div className="animated-poker-table">
      <div className="felt-ring"/>
      {seatOrder.map((position,index)=>{
        const isHero=position===heroPosition;
        const isVillain=position===villainPosition;
        const active=position===activePosition;
        return <div key={position} className={`animated-seat ${seatClass[index]} ${active?"active":""} ${isHero?"hero-seat":""}`}>
          <div className="hole-cards" aria-hidden="true">
            {isHero&&heroCards.length>=2?<>{heroCards.slice(0,2).map((card,i)=><span className="face-card" key={`${card}-${i}`}>{card}</span>)}</>:<><span className="back-card"/><span className="back-card second"/></>}
          </div>
          <div className="seat-label"><strong>{isHero?"HERO":isVillain?"VILLAIN":position}</strong><small>{position}</small></div>
          <div className="chips"><i/><i/><i/></div>
        </div>;
      })}

      <div className="dealer-button">D</div>
      <div className="pot-display"><small>POT</small><strong>{pot}</strong></div>

      <div className="community-board">
        {tableCards.map((card,index)=>{
          const shown=index<visibleBoard&&card!=="?";
          return <span key={`${card}-${index}`} className={shown?"community-card shown":"community-card placeholder"}>{shown?card:""}</span>;
        })}
      </div>

      <div className="street-label">{board.length>=5?"RIVER":board.length===4?"TURN":board.length>=3?"FLOP":"PREFLOP"}</div>
      <div className="action-status" aria-live="polite">{step<2?`${villainPosition} EM AÇÃO`:step<4?"AGUARDANDO HERO":"SUA VEZ"}</div>
    </div>

    <style jsx>{`
      .animated-table-shell{padding:18px 0 26px;width:100%;overflow:hidden}
      .animated-poker-table{position:relative;width:min(100%,540px);aspect-ratio:0.67;margin:0 auto;border-radius:48% / 28%;background:linear-gradient(90deg,#2c160e 0 5%,#111 5% 10%,#145232 10% 90%,#111 90% 95%,#2c160e 95%);border:7px solid #111;box-shadow:inset 0 0 0 3px #513421,inset 0 0 55px #06150d,0 16px 38px #0008}
      .felt-ring{position:absolute;inset:8.5% 11%;border:2px solid #ffffff35;border-radius:48% / 28%;pointer-events:none}
      .animated-seat{position:absolute;width:112px;z-index:4;transform:translate(-50%,-50%);transition:filter .25s ease,opacity .25s ease}
      .animated-seat.active .seat-label{border-color:#8effae;box-shadow:0 0 0 2px #5dff8d55,0 0 18px #4dff7f44}
      .animated-seat.hero-seat .seat-label{border-color:#f4f4f4;background:linear-gradient(#2c130f,#8d1e16)}
      .seat-label{position:relative;background:linear-gradient(#191d1b,#090b0a);border:2px solid #725f4a;border-radius:10px;padding:6px 8px;text-align:center;color:#fff;box-shadow:0 5px 10px #0009}
      .seat-label strong{display:block;font-size:12px;line-height:1.1;letter-spacing:.4px}.seat-label small{display:block;margin-top:2px;color:#bcc5bf;font-size:9px}
      .hole-cards{height:34px;display:flex;justify-content:center;align-items:flex-end;margin-bottom:-1px}
      .back-card,.face-card{display:grid;place-items:center;width:29px;height:40px;border:2px solid #e9eceb;border-radius:4px;background:repeating-linear-gradient(45deg,#73849d 0 2px,#566780 2px 4px);box-shadow:0 2px 5px #0008}.back-card.second{margin-left:-5px;transform:rotate(4deg)}
      .face-card{background:#fff;color:#121412;font-size:11px;font-weight:900;margin:0 1px}.face-card:nth-child(1){transform:rotate(-4deg)}.face-card:nth-child(2){transform:rotate(4deg)}
      .chips{position:absolute;left:50%;top:76px;display:flex;transform:translateX(-50%);gap:2px}.chips i{width:12px;height:12px;border-radius:50%;border:2px dashed #fff9;background:#c83b32}.chips i:nth-child(2){background:#325fa8}.chips i:nth-child(3){background:#202422}
      .s1{left:50%;top:7%}.s2{left:76%;top:15%}.s3{left:92%;top:29%}.s4{left:94%;top:48%}.s5{left:83%;top:68%}.s6{left:65%;top:88%}.s7{left:35%;top:88%}.s8{left:17%;top:68%}.s9{left:6%;top:48%}
      .dealer-button{position:absolute;left:29%;bottom:27%;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#eee;color:#171717;font-weight:900;font-size:11px;box-shadow:0 2px 5px #0008}
      .pot-display{position:absolute;left:50%;top:35%;transform:translate(-50%,-50%);min-width:110px;padding:7px 14px;border-radius:18px;background:#092819dd;border:1px solid #ffffff24;text-align:center}.pot-display small{display:block;font-size:8px;color:#aab8af}.pot-display strong{display:block;color:#fff;font-size:17px;margin-top:1px}
      .community-board{position:absolute;left:50%;top:47%;transform:translate(-50%,-50%);display:flex;gap:4px;z-index:3}.community-card{width:42px;height:58px;border-radius:5px;display:grid;place-items:center;font-size:15px;font-weight:900;transition:transform .28s ease,opacity .28s ease}.community-card.shown{background:#f3f4f2;color:#171817;box-shadow:0 3px 8px #0008;animation:deal .3s ease-out}.community-card.placeholder{border:1px solid #ffffff39;background:#173b29aa}
      .street-label{position:absolute;left:50%;top:55.5%;transform:translateX(-50%);font-size:9px;font-weight:900;letter-spacing:1.4px;color:#d5ddd8aa}
      .action-status{position:absolute;left:50%;bottom:18%;transform:translateX(-50%);padding:7px 12px;border-radius:9px;background:#06140ddd;border:1px solid #5dff8d66;color:#9dffba;font-size:9px;font-weight:900;letter-spacing:1px;white-space:nowrap}
      @keyframes deal{from{opacity:0;transform:translateY(-16px) rotate(-7deg)}to{opacity:1;transform:none}}
      @media(max-width:560px){.animated-poker-table{width:100%;border-width:6px}.animated-seat{width:82px}.seat-label{padding:5px 4px}.seat-label strong{font-size:9px}.seat-label small{font-size:7px}.hole-cards{height:28px}.back-card,.face-card{width:23px;height:32px;font-size:8px}.chips{top:61px}.chips i{width:9px;height:9px}.community-card{width:31px;height:44px;font-size:11px}.pot-display{min-width:88px}.pot-display strong{font-size:14px}}
      @media(prefers-reduced-motion:reduce){.community-card.shown{animation:none}.animated-seat{transition:none}}
    `}</style>
  </div>;
}
