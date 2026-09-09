import type {GameMode,PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";
import {buildBalancedSpotSession} from "@/lib/player-dna-sampler";
import {getExactSolverReference,hasExactSolverReference,type SolverReferencedSpot} from "@/lib/player-dna-solver-reference";

type PriorAnswer={action:PlayerAction};
export type SolverReferenceResolver=(spot:PlayerDnaSpot)=>SolverReferencedSpot;
export type CoveredSessionResult={spots:SolverReferencedSpot[];requested:number;generatedCandidates:number;rejectedUncovered:number;coveragePct:number};

export function stripInheritedSolverReference(spot:PlayerDnaSpot):PlayerDnaSpot{
  const clone={...(spot as PlayerDnaSpot&{solverReference?:unknown})};
  delete clone.solverReference;
  return clone;
}

export function isSolverCoveredSpot(spot:PlayerDnaSpot){return hasExactSolverReference(spot)}

export function buildSolverCoveredSpotSession(
  bank:PlayerDnaSpot[],
  mode:GameMode,
  count:number,
  resolver:SolverReferenceResolver,
  seed=Date.now(),
  answers:PriorAnswer[]=[],
):CoveredSessionResult{
  if(count<=0)return{spots:[],requested:count,generatedCandidates:0,rejectedUncovered:0,coveragePct:100};
  const output:SolverReferencedSpot[]=[];const seen=new Set<string>();let generatedCandidates=0,rejectedUncovered=0;
  const batchSize=Math.max(8,Math.min(128,count*2));const maxCandidates=Math.max(batchSize,count*12);
  let batch=0;
  while(output.length<count&&generatedCandidates<maxCandidates){
    const remaining=Math.min(batchSize,maxCandidates-generatedCandidates);
    const candidates=buildBalancedSpotSession(bank,mode,remaining,seed+(batch*0x9e3779b9),answers);
    for(const candidate of candidates){
      generatedCandidates+=1;
      const clean=stripInheritedSolverReference(candidate);
      const resolved=resolver(clean);
      const ref=getExactSolverReference(resolved);
      if(!ref){rejectedUncovered+=1;continue}
      const key=`${ref.spotFingerprint}:${resolved.id}`;
      if(seen.has(key))continue;
      seen.add(key);output.push(resolved as SolverReferencedSpot);
      if(output.length>=count)break;
    }
    batch+=1;
  }
  return{spots:output,requested:count,generatedCandidates,rejectedUncovered,coveragePct:output.length===count?100:Math.round((output.length/Math.max(1,count))*10000)/100};
}
