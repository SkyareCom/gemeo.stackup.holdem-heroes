import {assessPreflopAllIn,calculateHandMath,type HandReviewInput} from "./hand-review";
import {createExchangeEnvelope,type StackupActionRecord,type StackupExchangeEnvelope,type StackupLeakExchange,type StackupPlayerRef,type StackupSpotExchange,type StackupTrainingPrescription} from "./stackup-exchange";
import {candidatesFromExchange,type DailyPulseCandidate} from "./daily-pulse";

export type HandReviewExchangeBundle={
 envelope:StackupExchangeEnvelope;
 spot:StackupSpotExchange;
 leaks:StackupLeakExchange[];
 prescriptions:StackupTrainingPrescription[];
 pulseCandidates:DailyPulseCandidate[];
};

export function buildHandReviewExchange(input:HandReviewInput,options?:{playerId?:string;reviewId?:string;createdAt?:number}):HandReviewExchangeBundle{
 const createdAt=options?.createdAt??Date.now();
 const reviewId=options?.reviewId??`hand-review-${createdAt}`;
 const player:StackupPlayerRef={playerId:options?.playerId??"local-player"};
 const math=calculateHandMath(input);
 const allIn=assessPreflopAllIn(input);
 const actions:StackupActionRecord=[];
 let sequence=0;
 for(const position of input.villainPositions){
  const action=input.villainActions[position];if(!action)continue;
  const amount=input.villainActionAmounts[position]??null;
  actions.push({actor:position,position,action,amount,amountBb:input.bigBlind&&amount!=null?amount/input.bigBlind:null,potBefore:input.pot??0,street:input.street,sequence:sequence++,allIn:action==="ALL-IN"});
 }
 if(input.heroAction){const amount=input.heroActionAmount??null;actions.push({actor:"HERO",position:input.heroPosition,action:input.heroAction,amount,amountBb:input.bigBlind&&amount!=null?amount/input.bigBlind:null,potBefore:math.potBeforeHeroAction,street:input.street,sequence:sequence++,allIn:input.heroAction==="ALL-IN"})}
 const expected=allIn.recommendedAction??null;
 const correct=allIn.classification==="DECISÃO CORRETA"?true:allIn.classification==="DECISÃO INCORRETA"?false:null;
 const leakTags:string[]=[];if(correct===false)leakTags.push("ALL-IN PREFLOP");
 if(math.potOdds!==null)leakTags.push("POT ODDS");
 const trainingTags=[...new Set([input.street==="PREFLOP"?"PREFLOP":"POSTFLOP",...(allIn.applies?["ALL-IN PREFLOP"]:[]),...(math.potOdds!==null?["POT ODDS"]:[])])];
 const spot:StackupSpotExchange={
  exchangeVersion:"1.2.0",id:`spot-${reviewId}`,source:"HAND_REVIEW",sourceApp:"STACKUP_HOLD_EM_SOLVER",sourceRecordId:reviewId,player,mode:input.game,street:input.street,
  context:{tableSize:input.tableSize,heroPosition:input.heroPosition,villainPositions:input.villainPositions,heroCards:input.heroCards,board:input.board,effectiveStack:math.effectiveStack,effectiveStackBb:math.effectiveStackBB,pot:math.potBeforeHeroAction,potBb:math.potBeforeHeroActionBB,tournament:input.game==="TORNEIO"?{blindBig:input.bigBlind,ante:input.ante,heroStackBb:input.bigBlind&&input.heroStack?input.heroStack/input.bigBlind:null,icm:input.tournamentPhase==="BOLHA ITM"||input.tournamentPhase==="BOLHA FT"||input.tournamentPhase==="FT",bubble:input.tournamentPhase==="BOLHA ITM"||input.tournamentPhase==="BOLHA FT",finalTable:input.tournamentPhase==="FT"}:null},
  heroPosition:input.heroPosition,heroCards:input.heroCards,board:input.board,stacks:Object.fromEntries([[input.heroPosition??"HERO",input.heroStack??0],...input.villainPositions.map(p=>[p,input.villainStacks[p]??0])]),pot:math.potBeforeHeroAction,actions,selectedAction:input.heroAction,expectedAction:expected,acceptedActions:expected?[expected]:undefined,correct,
  decision:{outcome:correct===true?"CORRETA":correct===false?"INCORRETA":"NAO_AVALIADA",equity:allIn.estimatedEquity,potOdds:math.potOdds,requiredEquity:math.equityRequired,score:allIn.margin},
  review:{reviewRequired:correct===false,reason:correct===false?"ERRO":null,reviewCount:0,lastReviewedAt:null,nextReviewAt:null,intervalDays:null,easeFactor:null,mastery:correct===true?100:correct===false?0:null},
  tags:[input.game,input.street,...input.tournamentTypes],leakTags,trainingTags,conceptTags:[...(math.potOdds!==null?["POT_ODDS","EQUITY"]:[]),...(allIn.applies?["PREFLOP_ALL_IN"]:[])],difficulty:allIn.applies?4:3,confidence:allIn.classification==="DADOS INSUFICIENTES"?45:75,occurredAt:createdAt,
  metadata:{notes:input.notes,fieldLeft:input.fieldLeft,tournamentPhase:input.tournamentPhase,spr:math.spr,alpha:math.alpha,mdf:math.mdf,allInAssessment:allIn}
 };
 const leaks:StackupLeakExchange[]=[];
 const prescriptions:StackupTrainingPrescription[]=[];
 if(correct===false){
  const leak:StackupLeakExchange={id:`leak-${reviewId}-preflop-allin`,player,analysisId:reviewId,title:"ERRO EM ALL-IN PRÉ-FLOP",description:allIn.reason,severity:Math.abs(allIn.margin??0)>=8?"ALTA":"MEDIA",confidence:75,sourceEvidenceIds:[spot.id],trainingTags:["ALL-IN PREFLOP","POT ODDS"],firstSeenAt:createdAt,lastSeenAt:createdAt,status:"ATIVO"};
  leaks.push(leak);
  prescriptions.push({id:`training-${reviewId}-preflop-allin`,player,createdBy:"HAND_REVIEW",analysisId:reviewId,leakId:leak.id,title:"REVISAR ALL-IN PRÉ-FLOP",reason:allIn.reason,priority:leak.severity,trainingTags:leak.trainingTags,conceptTags:["PREFLOP_ALL_IN","POT_ODDS","EQUITY"],targetSpots:25,mode:input.game,street:"PREFLOP",positions:[input.heroPosition??"HERO",...input.villainPositions],difficultyMin:3,difficultyMax:5,timerSeconds:15,reviewWrongAnswers:true,status:"PENDENTE",createdAt});
 }
 const envelope=createExchangeEnvelope({producer:"STACKUP_HOLD_EM_SOLVER",producerVersion:"HAND_REVIEW_V1",player,spots:[spot],leaks,prescriptions,metadata:{reviewId}});
 return{envelope,spot,leaks,prescriptions,pulseCandidates:candidatesFromExchange({spots:[spot],leaks,prescriptions})};
}
