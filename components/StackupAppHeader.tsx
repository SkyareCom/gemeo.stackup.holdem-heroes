import Link from "next/link";
import fs from "node:fs";
import path from "node:path";

const HOME_ART_PARTS=[
  "home-clean-v9.part0",
  "home-clean-v9.part2",
  "home-clean-v9.part3",
  "home-clean-v9.part4",
  "home-clean-v9.part5",
] as const;
const EXPECTED_BASE64_LENGTH=38700;

function loadFrozenHomeArtwork(){
  try{
    const base64=HOME_ART_PARTS.map(name=>fs.readFileSync(path.join(process.cwd(),"public",name),"utf8").trim()).join("").replace(/\s+/g,"");
    if(base64.length!==EXPECTED_BASE64_LENGTH)throw new Error(`invalid frozen home artwork length: ${base64.length}`);
    return `data:image/webp;base64,${base64}`;
  }catch(error){
    console.error("STACKUP INTERNAL HEADER ARTWORK BUILD FAILED",error);
    return "";
  }
}

const HOME_ARTWORK_SRC=loadFrozenHomeArtwork();

export default function StackupAppHeader(){
  return <header className="stackup-internal-brand-header" aria-label="STACKUP HOLD'EM HEROES">
    <Link className="stackup-internal-brand-link" href="/" aria-label="STACKUP HOLD'EM HEROES — INÍCIO">
      {HOME_ARTWORK_SRC&&<img className="stackup-internal-header-art" src={HOME_ARTWORK_SRC} alt="" width="432" height="768" draggable={false}/>} 
      <span className="stackup-internal-brand-copy" aria-hidden="true">
        <span className="stackup-internal-brand-name">STACKUP HOLD’EM</span>
        <span className="stackup-internal-brand-heroes">HEROES</span>
        <span className="stackup-internal-brand-subtitle">AI POKER PERFORMANCE SYSTEM</span>
      </span>
    </Link>
  </header>;
}
