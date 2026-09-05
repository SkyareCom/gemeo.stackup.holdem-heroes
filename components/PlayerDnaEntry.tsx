"use client";

import {useState} from "react";
import AnimatedPlayerDnaTable from "./AnimatedPlayerDnaTable";
import PlayerDnaWorkspace from "./PlayerDnaWorkspace";
import type {PlayerDnaSpot} from "@/data/player-dna-spots";

const previewSpot:PlayerDnaSpot={
  id:"player-dna-preview",
  mode:"TORNEIO",
  street:"FLOP",
  heroCards:"A♠ K♥",
  board:"8♦ J♥ 4♣",
  players:[
    {position:"BTN",stack:29,action:"AGUARDA",value:0,hero:true},
    {position:"UTG",stack:42,action:"FOLD",value:0},
    {position:"UTG+1",stack:34,action:"FOLD",value:0},
    {position:"MP",stack:31,action:"RAISE",value:2.2},
    {position:"MP+1",stack:27,action:"FOLD",value:0},
    {position:"HJ",stack:38,action:"CALL",value:2.2},
    {position:"CO",stack:24,action:"FOLD",value:0},
    {position:"SB",stack:19,action:"FOLD",value:0},
    {position:"BB",stack:52,action:"CALL",value:1.2},
    {position:"LJ",stack:33,action:"FOLD",value:0}
  ],
  pot:{main:12.5},
  scenario:["TORNEIO","PLAYER DNA","SPOT DINÂMICO"],
  prompt:"Prévia visual do motor de spots Player DNA.",
  actions:["FOLD","CALL","RAISE","ALL-IN"],
  weights:{}
};

export default function PlayerDnaEntry(){
  const[started,setStarted]=useState(false);
  if(started)return <PlayerDnaWorkspace/>;
  return <div className="player-dna-entry">
    <div className="eyebrow">PLAYER DNA</div>
    <h2>DESCUBRA SEU PERFIL</h2>
    <p className="setup-intro">A mesa reproduz os spots criados pelo motor e para no momento da sua decisão.</p>
    <AnimatedPlayerDnaTable spot={previewSpot} anteMode="NONE" selectedAction={null} onSequenceReady={()=>{}}/>
    <button type="button" className="primary player-dna-start" onClick={()=>setStarted(true)}>INICIAR ANÁLISE</button>
  </div>;
}
