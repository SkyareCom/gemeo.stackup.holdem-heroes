"use client";

import {useEffect} from "react";

export default function PlayerDnaStartFix(){
  useEffect(()=>{
    let lastTap=0;
    const handlePointerUp=(event:PointerEvent)=>{
      const target=(event.target as HTMLElement|null)?.closest<HTMLButtonElement>(".depth-choices button");
      if(!target)return;
      const now=Date.now();
      if(now-lastTap<350)return;
      lastTap=now;
      window.setTimeout(()=>{
        if(document.body.contains(target))target.click();
      },0);
    };
    document.addEventListener("pointerup",handlePointerUp,{capture:true});
    return()=>document.removeEventListener("pointerup",handlePointerUp,{capture:true} as EventListenerOptions);
  },[]);
  return null;
}
