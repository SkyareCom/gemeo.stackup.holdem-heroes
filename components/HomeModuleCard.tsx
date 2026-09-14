"use client";

import Link from "next/link";
import {useEffect,useRef} from "react";

type HomeModuleIcon = "player" | "math" | "hand" | "assistant" | "language";

type HomeModuleCardProps = {
  title: string;
  copyLines: readonly [string, string];
  icon: HomeModuleIcon;
  href?: string;
  className?: string;
};

function ModuleIcon({type}:{type:HomeModuleIcon}){
  if(type === "math"){
    return <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect x="10" y="36" width="10" height="18" rx="1"/><rect x="27" y="26" width="10" height="28" rx="1"/><rect x="44" y="14" width="10" height="40" rx="1"/></svg>;
  }
  if(type === "hand"){
    return <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"><rect x="13" y="14" width="31" height="38" rx="4" transform="rotate(-10 28.5 33)"/><rect x="23" y="12" width="31" height="38" rx="4" transform="rotate(8 38.5 31)"/></g><path d="M38 25c-4.6 0-7.5 4.1-7.5 7.1 0 4.8 7.5 9.6 7.5 9.6s7.5-4.8 7.5-9.6C45.5 29.1 42.6 25 38 25Z" fill="currentColor"/></svg>;
  }
  if(type === "assistant"){
    return <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M32 10v7"/><circle cx="32" cy="8" r="2" fill="currentColor"/><rect x="14" y="18" width="36" height="29" rx="9"/><path d="M8 27v11M56 27v11M22 47v7M42 47v7M20 54h24"/></g><circle cx="25" cy="32" r="3" fill="currentColor"/><circle cx="39" cy="32" r="3" fill="currentColor"/></svg>;
  }
  if(type === "language"){
    return <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="32" cy="32" r="22"/><path d="M10 32h44M32 10c6 6 10 13 10 22S38 48 32 54M32 10c-6 6-10 13-10 22s4 16 10 22"/></g></svg>;
  }
  return <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="23" cy="19" r="8" fill="currentColor"/><path d="M8 49c1-11 6-17 15-17 5 0 9 2 12 6"/><path d="M44 18c-7 2-11 8-11 15s4 13 11 15M52 18c-7 2-11 8-11 15s4 13 11 15M36 22h13M34 32h16M36 42h13"/></g></svg>;
}

function CardContents({title,copyLines,icon}:{title:string;copyLines:readonly [string,string];icon:HomeModuleIcon}){
  return <>
    <div className="homeModuleIcon" aria-hidden="true"><ModuleIcon type={icon}/></div>
    <div className="homeModuleTitle">{title}</div>
    <div className="homeModuleCopy" data-preserve-case="true"><span>{copyLines[0]}</span><br/><span>{copyLines[1]}</span></div>
    <div className="homeModuleArrow" aria-hidden="true"><svg viewBox="0 0 24 40" focusable="false"><path d="M5 4l12 16L5 36"/></svg></div>
  </>;
}

function forceSurface(node:HTMLElement|null, icon:HomeModuleIcon){
  if(!node) return;
  node.style.setProperty("background-color","#ffffff","important");
  node.style.setProperty("background-image","linear-gradient(180deg,#ffffff 0%,#f8fcff 54%,#eef8ff 100%)","important");
  node.style.setProperty("border-color","#9edfff","important");

  const iconBox=node.querySelector<HTMLElement>(".homeModuleIcon");
  if(iconBox){
    iconBox.style.setProperty("background-color","#061f41","important");
    iconBox.style.setProperty("background-image","linear-gradient(180deg,#082b54 0%,#061f41 100%)","important");
    iconBox.style.setProperty("border-color","#168bc8","important");
    iconBox.style.setProperty("color","#e8f8ff","important");
  }

  const svg=iconBox?.querySelector<SVGSVGElement>("svg");
  if(svg){
    svg.style.setProperty("fill","none","important");
    svg.style.setProperty("stroke","#e8f8ff","important");
    svg.style.setProperty("color","#e8f8ff","important");
    if(icon==="math"){
      svg.querySelectorAll<SVGRectElement>("rect").forEach(rect=>{
        rect.style.setProperty("fill","#e8f8ff","important");
        rect.style.setProperty("stroke","none","important");
      });
    }
  }
}

export default function HomeModuleCard({title,copyLines,icon,href,className=""}:HomeModuleCardProps){
  const classes = `homeModuleCard ${className}`.trim();
  const linkRef=useRef<HTMLAnchorElement>(null);
  const divRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    forceSurface(href ? linkRef.current : divRef.current,icon);
  },[href,icon]);

  if(href){
    return <Link ref={linkRef} className={classes} href={href} aria-label={title}><CardContents title={title} copyLines={copyLines} icon={icon}/></Link>;
  }
  return <div ref={divRef} className={classes} aria-label={title}><CardContents title={title} copyLines={copyLines} icon={icon}/></div>;
}
