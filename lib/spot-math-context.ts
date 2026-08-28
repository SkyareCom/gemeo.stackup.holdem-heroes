export type SpotMathInput = {
  potBeforeBet: number;
  betToHero?: number;
  callAmount?: number;
  effectiveStack: number;
  outs?: number;
  cardsToCome?: 1 | 2;
  expectedFutureWin?: number;
};

export type ExactOrEstimate = {
  value: number | null;
  kind: "EXACT" | "ESTIMATE" | "INSUFFICIENT";
};

const safe = (n: number) => Number.isFinite(n) && n >= 0;

export function calculateSpotMath(input: SpotMathInput) {
  const pot = safe(input.potBeforeBet) ? input.potBeforeBet : 0;
  const bet = safe(input.betToHero ?? 0) ? input.betToHero ?? 0 : 0;
  const call = safe(input.callAmount ?? bet) ? input.callAmount ?? bet : bet;
  const stack = safe(input.effectiveStack) ? input.effectiveStack : 0;
  const potAfterBet = pot + bet;
  const finalPotAfterCall = potAfterBet + call;

  const spr: ExactOrEstimate = { value: pot > 0 ? stack / pot : null, kind: pot > 0 ? "EXACT" : "INSUFFICIENT" };
  const requiredEquity: ExactOrEstimate = { value: call > 0 && finalPotAfterCall > 0 ? call / finalPotAfterCall : null, kind: call > 0 ? "EXACT" : "INSUFFICIENT" };
  const potOddsRatio: ExactOrEstimate = { value: call > 0 ? potAfterBet / call : null, kind: call > 0 ? "EXACT" : "INSUFFICIENT" };

  let outsEquity: ExactOrEstimate = { value: null, kind: "INSUFFICIENT" };
  if (input.outs !== undefined && input.cardsToCome) {
    const multiplier = input.cardsToCome === 2 ? 4 : 2;
    outsEquity = { value: Math.min(1, input.outs * multiplier / 100), kind: "ESTIMATE" };
  }

  const impliedRequiredEquity: ExactOrEstimate = input.expectedFutureWin !== undefined && call > 0
    ? { value: call / (finalPotAfterCall + Math.max(0, input.expectedFutureWin)), kind: "ESTIMATE" }
    : { value: null, kind: "INSUFFICIENT" };

  return { pot, potAfterBet, finalPotAfterCall, call, spr, requiredEquity, potOddsRatio, outsEquity, impliedRequiredEquity };
}

export const asPercent = (metric: ExactOrEstimate) => metric.value === null ? "—" : `${(metric.value * 100).toFixed(1)}%`;
export const asNumber = (metric: ExactOrEstimate, digits = 1) => metric.value === null ? "—" : metric.value.toFixed(digits);
