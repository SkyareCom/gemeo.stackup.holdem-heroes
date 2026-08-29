import {NextRequest,NextResponse} from "next/server";
import {completePokerQuestion} from "@/lib/stackup-ai-server";
import {classifyDepth,creditCost,isPokerQuestion,normalizeDepth,STACKUP_AI_PLAN_POLICIES,StackupAiPlan} from "@/lib/stackup-ai";

export const runtime="nodejs";

function defaultPlan():StackupAiPlan{
  const value=(process.env.STACKUP_AI_DEFAULT_PLAN||"FREE").toUpperCase();
  return (["FREE","PRO","ELITE","UNLIMITED"] as const).includes(value as StackupAiPlan)?value as StackupAiPlan:"FREE";
}

export async function POST(request:NextRequest){
  let body:{question?:unknown};
  try{body=await request.json()}catch{return NextResponse.json({error:"INVALID_REQUEST"},{status:400})}
  const question=typeof body.question==="string"?body.question.trim():"";
  if(!isPokerQuestion(question))return NextResponse.json({error:"QUESTION_REQUIRED"},{status:400});
  if(question.length>4000)return NextResponse.json({error:"QUESTION_TOO_LONG"},{status:413});

  // This is the only entitlement resolution point. When authentication/billing lands,
  // replace defaultPlan() with the authenticated subscriber plan from the database.
  const plan=defaultPlan();
  const requestedDepth=classifyDepth(question);
  const depth=normalizeDepth(plan,requestedDepth);
  const credits=creditCost(depth);

  try{
    const completion=await completePokerQuestion(question,depth);
    // Provider/model intentionally stay server-side: customers consume STACKUP AI credits,
    // not a named third-party API. This lets the router change providers without changing plans.
    if(process.env.NODE_ENV!=="production")console.info("[stackup-ai]",{provider:completion.provider,model:completion.model,depth,credits,plan});
    return NextResponse.json({
      answer:completion.text,
      meta:{depth,credits,plan,policy:STACKUP_AI_PLAN_POLICIES[plan]}
    });
  }catch(error){
    console.error("[stackup-ai] completion failed",error instanceof Error?error.message:error);
    return NextResponse.json({error:"AI_TEMPORARILY_UNAVAILABLE"},{status:503});
  }
}
