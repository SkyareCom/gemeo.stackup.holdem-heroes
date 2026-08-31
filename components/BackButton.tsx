"use client";

import {useRouter} from "next/navigation";

export default function BackButton({eventName}:{eventName?:string}){
  const router=useRouter();
  return <button type="button" className="module-back" onClick={()=>eventName?window.dispatchEvent(new Event(eventName)):router.back()}>← ANTERIOR</button>;
}
