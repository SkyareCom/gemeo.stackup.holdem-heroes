import {NextRequest,NextResponse} from "next/server";
import {completePokerQuestion} from "@/lib/stackup-ai-server";
import {creditCost,isPokerQuestion,normalizeDepth,StackupAiDepth,StackupAiPlan} from "@/lib/stackup-ai";

export const runtime="nodejs";

function defaultPlan():StackupAiPlan{
  const value=(process.env.STACKUP_AI_DEFAULT_PLAN||"FREE").toUpperCase();
  return (["FREE","PRO","ELITE","UNLIMITED"] as const).includes(value as StackupAiPlan)?value as StackupAiPlan:"FREE";
}

function requestedDepth(value:unknown):StackupAiDepth{
  return value==="SMART"||value==="DEEP"?value:"FAST";
}

export async function POST(request:NextRequest){
  let body:{question?:unknown;depth?:unknown};
  try{body=await request.json()}catch{return NextResponse.json({error:"INVALID_REQUEST"},{status:400})}
  const question=typeof body.question==="string"?body.question.trim():"";
  if(!isPokerQuestion(question))return NextResponse.json({error:"QUESTION_REQUIRED"},{status:400});
  if(question.length>2500)return NextResponse.json({error:"QUESTION_TOO_LONG"},{status:400});

  // Anonymous preview uses the server-defined plan. When authentication lands,
  // this single resolution point can be replaced by the subscriber entitlement.
  const plan=defaultPlan();
  const depth=normalizeDepth(plan,requestedDepth(body.depth));
  const credits=creditCost(depth);

  try{
    const completion=await completePokerQuestion(question,depth);
    // Provider/model intentionally stay server-side: subscribers buy STACKUP AI,
    // not direct access to a third-party provider.
    if(process.env.NODE_ENV!=="production")console.info("[stackup-ai]",{provider:completion.provider,model:completion.model,depth});
    return NextResponse.json({answer:completion.text,depth,credits});
  }catch(error){
    console.error("[stackup-ai] completion failed",error instanceof Error?error.message:error);
    return NextResponse.json({error:"AI_TEMPORARILY_UNAVAILABLE"},{status:503});
  }
}
