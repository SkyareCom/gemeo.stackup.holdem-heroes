import {
  bluffBreakEven,
  callEV,
  exactOutsProbability,
  mdf,
  outsApproxEquity,
  potOddsRatio as calculatePotOddsRatio,
  requiredEquity as calculateRequiredEquity,
  spr as calculateSPR,
} from "./poker-math";

export type SpotMathInput = {
  potBeforeBet: number;
  betToHero?: number;
  callAmount?: number;
  effectiveStack: number;
  outs?: number;
  cardsToCome?: 1 | 2;
  unseenCards?: number;
  expectedFutureWin?: number;
  heroEquity?: number;
};

export type ExactOrEstimate = {
  value: number | null;
  kind: "EXACT" | "ESTIMATE" | "INSUFFICIENT";
};

const safe = (n: number) => Number.isFinite(n) && n >= 0;
const metric = (value: number | null, kind: ExactOrEstimate["kind"]): ExactOrEstimate => ({ value, kind });

export function calculateSpotMath(input: SpotMathInput) {
  const pot = safe(input.potBeforeBet) ? input.potBeforeBet : 0;
  const bet = safe(input.betToHero ?? 0) ? input.betToHero ?? 0 : 0;
  const call = safe(input.callAmount ?? bet) ? input.callAmount ?? bet : bet;
  const stack = safe(input.effectiveStack) ? input.effectiveStack : 0;
  const potAfterBet = pot + bet;
  const finalPotAfterCall = potAfterBet + call;

  const spr = pot > 0 ? metric(calculateSPR(stack, pot), "EXACT") : metric(null, "INSUFFICIENT");
  const requiredEquity = call > 0 && finalPotAfterCall > 0
    ? metric(calculateRequiredEquity(pot, bet, call), "EXACT")
    : metric(null, "INSUFFICIENT");
  const potOddsRatio = call > 0
    ? metric(calculatePotOddsRatio(pot, bet, call), "EXACT")
    : metric(null, "INSUFFICIENT");
  const minimumDefenseFrequency = bet > 0 && pot > 0
    ? metric(mdf(pot, bet), "EXACT")
    : metric(null, "INSUFFICIENT");
  const bluffBreakEvenFrequency = bet > 0 && pot > 0
    ? metric(bluffBreakEven(pot, bet), "EXACT")
    : metric(null, "INSUFFICIENT");

  let outsEquityApprox = metric(null, "INSUFFICIENT");
  let outsEquityExact = metric(null, "INSUFFICIENT");
  if (input.outs !== undefined && input.cardsToCome && input.outs >= 0) {
    outsEquityApprox = metric(outsApproxEquity(input.outs, input.cardsToCome), "ESTIMATE");
    const unseenCards = input.unseenCards ?? (input.cardsToCome === 2 ? 47 : 46);
    if (input.outs <= unseenCards && unseenCards > 0) {
      outsEquityExact = metric(exactOutsProbability(input.outs, unseenCards, input.cardsToCome), "EXACT");
    }
  }

  const impliedRequiredEquity: ExactOrEstimate = input.expectedFutureWin !== undefined && call > 0
    ? metric(call / (finalPotAfterCall + Math.max(0, input.expectedFutureWin)), "ESTIMATE")
    : metric(null, "INSUFFICIENT");

  const callExpectedValue: ExactOrEstimate = input.heroEquity !== undefined && call > 0 && input.heroEquity >= 0 && input.heroEquity <= 1
    ? metric(callEV(input.heroEquity, potAfterBet, call), "EXACT")
    : metric(null, "INSUFFICIENT");

  return {
    pot,
    potAfterBet,
    finalPotAfterCall,
    call,
    spr,
    requiredEquity,
    potOddsRatio,
    minimumDefenseFrequency,
    bluffBreakEvenFrequency,
    outsEquity: outsEquityApprox,
    outsEquityApprox,
    outsEquityExact,
    impliedRequiredEquity,
    callExpectedValue,
  };
}

export const asPercent = (metric: ExactOrEstimate) => metric.value === null ? "—" : `${(metric.value * 100).toFixed(1)}%`;
export const asNumber = (metric: ExactOrEstimate, digits = 1) => metric.value === null ? "—" : metric.value.toFixed(digits);
export const asChips = (metric: ExactOrEstimate, digits = 0) => metric.value === null ? "—" : metric.value.toFixed(digits);
