export type GameMode="CASH"|"TORNEIO";

export const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

export function requiredEquity(potBeforeBet: number, villainBet: number, call: number = villainBet) {
  const finalPot = potBeforeBet + villainBet + call;
  return finalPot > 0 ? call / finalPot : 0;
}

export function potOdds(potBeforeBet: number, villainBet: number, call: number = villainBet) {
  return requiredEquity(potBeforeBet, villainBet, call);
}

export function spr(effectiveStack: number, pot: number) {
  return pot > 0 ? effectiveStack / pot : 0;
}

export function mdf(pot: number, bet: number) {
  return pot + bet > 0 ? pot / (pot + bet) : 0;
}

export function bluffBreakEven(pot: number, bet: number) {
  return pot + bet > 0 ? bet / (pot + bet) : 0;
}

export function simpleEV(winProbability: number, amountWon: number, loseProbability: number, amountLost: number) {
  return winProbability * amountWon - loseProbability * amountLost;
}

export function callEV(equity: number, potBeforeBet: number, villainBet: number, call: number = villainBet) {
  const winProfit = potBeforeBet + villainBet;
  return equity * winProfit - (1 - equity) * call;
}

export function bluffEV(foldProbability: number, pot: number, bet: number) {
  return foldProbability * pot - (1 - foldProbability) * bet;
}

export function outsApproxEquity(outs: number, cardsToCome: 1 | 2) {
  return Math.min(1, (Math.max(0,outs) * (cardsToCome === 2 ? 4 : 2)) / 100);
}

export function outsExactEquity(outs: number, cardsToCome: 1 | 2) {
  const safeOuts=Math.max(0,Math.min(46,outs));
  if(cardsToCome===1)return safeOuts/46;
  const missFlopToTurn=(47-safeOuts)/47;
  const missTurnToRiver=(46-safeOuts)/46;
  return 1-(missFlopToTurn*missTurnToRiver);
}

export function oddsAgainst(probability:number){
  if(probability<=0)return Infinity;
  if(probability>=1)return 0;
  return (1-probability)/probability;
}

export function impliedFutureWinNeeded(potBeforeBet:number,villainBet:number,call:number,equity:number){
  if(equity<=0)return Infinity;
  const currentFinalPot=potBeforeBet+villainBet+call;
  const targetFinalPot=call/equity;
  return Math.max(0,targetFinalPot-currentFinalPot);
}

export function effectiveStack(...stacks:number[]){
  const valid=stacks.filter(value=>Number.isFinite(value)&&value>=0);
  return valid.length?Math.min(...valid):0;
}

export function sanitizeAmount(value:number){return Number.isFinite(value)?Math.max(0,value):0}

// PLAYER DNA V185 — frozen validated sizing core.
// Tournament display is always BB. Cash display is always K.
export function sizingStep(mode:GameMode){return mode==="TORNEIO"?0.5:0.1}
export function ceilToStep(value:number,step:number){return Math.ceil((sanitizeAmount(value)-1e-9)/step)*step}
export function floorToStep(value:number,step:number){return Math.floor((sanitizeAmount(value)+1e-9)/step)*step}
export function formatPokerAmount(value:number,mode:GameMode){
  const step=sizingStep(mode);
  const rounded=Math.round(sanitizeAmount(value)/step)*step;
  const text=Math.abs(rounded-Math.round(rounded))<0.001?String(Math.round(rounded)):rounded.toFixed(1).replace(/\.0$/,"");
  return mode==="TORNEIO"?`${text} BB`:`${text}K`;
}

export function incrementalCall(currentBet:number,heroCommitted:number){
  return Math.max(0,sanitizeAmount(currentBet)-sanitizeAmount(heroCommitted));
}

export function minimumRaiseTo(currentBet:number,previousBetLevel=0){
  const current=sanitizeAmount(currentBet);
  const previous=Math.min(current,sanitizeAmount(previousBetLevel));
  if(current<=0)return 0;
  const lastFullRaise=previous>0?Math.max(1e-9,current-previous):current;
  return current+lastFullRaise;
}

export type RaiseSizingInput={
  mode:GameMode;
  street:"PREFLOP"|"FLOP"|"TURN"|"RIVER";
  effectiveStack:number;
  currentBet:number;
  previousBetLevel?:number;
  potBeforeAction:number;
  heroCommitted?:number;
  callers?:number;
  oop?:boolean;
  multiway?:boolean;
  context?:"3-BET"|"4-BET"|"5-BET"|"RAISE"|"BET";
};

export type RaiseSizingResult={
  small:number;
  large:number;
  minRaiseTo:number;
  effectiveStack:number;
  legalNonAllInExists:boolean;
};

export function playerDnaRaiseSizing(input:RaiseSizingInput):RaiseSizingResult{
  const step=sizingStep(input.mode);
  const eff=sanitizeAmount(input.effectiveStack);
  const current=sanitizeAmount(input.currentBet);
  const previous=sanitizeAmount(input.previousBetLevel??0);
  const potBefore=Math.max(0.1,sanitizeAmount(input.potBeforeAction));
  const heroPut=sanitizeAmount(input.heroCommitted??0);
  const callers=Math.max(0,Math.floor(input.callers??0));
  const rawMin=minimumRaiseTo(current,previous);
  const minLegal=current>0?ceilToStep(rawMin,step):0;
  let small=0;
  let large=0;

  if(input.street==="PREFLOP"&&current>0){
    const context=input.context??"3-BET";
    if(context==="3-BET"){
      small=current*(input.oop?4:3)+callers*current;
      large=current*(input.oop?5:4)+callers*current;
    }else if(context==="4-BET"){
      small=current*(input.oop?2.35:2.20);
      large=current*(input.oop?2.65:2.50);
    }else if(context==="5-BET"){
      small=current*2.05;
      large=current*2.25;
    }else{
      small=current*(input.oop?3.5:3);
      large=current*(input.oop?4.5:4);
    }
    small=Math.max(small,minLegal);
    large=Math.max(large,small+step);
  }else if(current>0){
    const call=incrementalCall(current,heroPut);
    const potAfterCall=potBefore+current+call;
    small=current+potAfterCall*(input.multiway?0.60:0.50);
    large=current+potAfterCall*(input.multiway?0.95:0.85);
    small=Math.max(small,minLegal);
    large=Math.max(large,small+step);
  }else{
    small=potBefore*(input.multiway?0.50:0.40);
    large=potBefore*(input.multiway?0.75:0.70);
    small=Math.max(step,small);
    large=Math.max(small+step,large);
  }

  const ceiling=Math.max(step,floorToStep(Math.max(0,eff-step),step));
  const legalNonAllInExists=current<=0||ceiling+1e-9>=minLegal;
  if(current>0&&!legalNonAllInExists){
    large=ceiling;
    small=Math.max(step,floorToStep(Math.max(0,ceiling-step),step));
  }else{
    small=Math.min(small,ceiling);
    large=Math.min(large,ceiling);
    const desiredGap=input.mode==="TORNEIO"?Math.max(1,Math.min(3,eff*0.05)):Math.max(1,Math.min(10,eff*0.06));
    if(large-small<desiredGap){
      large=ceiling;
      small=Math.max(current>0?minLegal:step,large-desiredGap);
    }
    small=current>0?ceilToStep(small,step):Math.round(small/step)*step;
    large=current>0?ceilToStep(large,step):Math.round(large/step)*step;
    small=Math.min(small,ceiling);
    large=Math.min(large,ceiling);
    if(current>0){
      small=Math.max(small,minLegal);
      large=Math.max(large,Math.min(ceiling,small+step));
    }
    if(large<=small){
      if(small+step<=ceiling+1e-9)large=small+step;
      else if(small-step+1e-9>=(current>0?minLegal:step))small-=step;
    }
  }

  return {small:+small.toFixed(4),large:+large.toFixed(4),minRaiseTo:rawMin,effectiveStack:eff,legalNonAllInExists};
}

export function validatePlayerDnaRaiseSizing(input:RaiseSizingInput){
  const result=playerDnaRaiseSizing(input);
  const errors:string[]=[];
  const step=sizingStep(input.mode);
  const displayedMin=input.currentBet>0?ceilToStep(result.minRaiseTo,step):0;
  if(!Number.isFinite(result.small)||!Number.isFinite(result.large))errors.push("NON_FINITE_RAISE");
  if(result.small<0||result.large<0)errors.push("NEGATIVE_RAISE");
  if(result.legalNonAllInExists&&result.large<=result.small)errors.push("DUPLICATE_OR_REVERSED_RAISE");
  if(result.small>=result.effectiveStack-1e-9&&result.effectiveStack>step)errors.push("SMALL_EQUALS_ALLIN");
  if(result.large>=result.effectiveStack-1e-9&&result.effectiveStack>step)errors.push("LARGE_EQUALS_ALLIN");
  if(input.currentBet>0&&result.legalNonAllInExists&&(result.small+1e-9<displayedMin||result.large+1e-9<displayedMin))errors.push("BELOW_MIN_RAISE");
  return {ok:errors.length===0,errors,result};
}
