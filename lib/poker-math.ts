export type MathConfidence = "EXACT" | "ESTIMATE" | "INSUFFICIENT";

export type MathResult = {
  value: number | null;
  confidence: MathConfidence;
};

export const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

const valid = (...values: number[]) => values.every(Number.isFinite);

export function requiredEquity(potBeforeBet: number, villainBet: number, call: number = villainBet) {
  if (!valid(potBeforeBet, villainBet, call) || potBeforeBet < 0 || villainBet < 0 || call < 0) return 0;
  const finalPot = potBeforeBet + villainBet + call;
  return finalPot > 0 ? call / finalPot : 0;
}

export function potOdds(potBeforeBet: number, villainBet: number, call: number = villainBet) {
  return requiredEquity(potBeforeBet, villainBet, call);
}

export function potOddsRatio(potBeforeBet: number, villainBet: number, call: number = villainBet) {
  if (call <= 0) return Infinity;
  return (potBeforeBet + villainBet) / call;
}

export function spr(effectiveStack: number, pot: number) {
  return valid(effectiveStack, pot) && pot > 0 ? effectiveStack / pot : 0;
}

export function mdf(pot: number, bet: number) {
  return valid(pot, bet) && pot + bet > 0 ? pot / (pot + bet) : 0;
}

export function bluffBreakEven(pot: number, bet: number) {
  return valid(pot, bet) && pot + bet > 0 ? bet / (pot + bet) : 0;
}

export function simpleEV(winProbability: number, amountWon: number, loseProbability: number, amountLost: number) {
  if (!valid(winProbability, amountWon, loseProbability, amountLost)) return 0;
  return winProbability * amountWon - loseProbability * amountLost;
}

export function callEV(equity: number, potBeforeCall: number, callAmount: number) {
  if (!valid(equity, potBeforeCall, callAmount) || callAmount < 0) return 0;
  return equity * potBeforeCall - (1 - equity) * callAmount;
}

export function bluffEV(foldProbability: number, pot: number, bet: number) {
  if (!valid(foldProbability, pot, bet)) return 0;
  return foldProbability * pot - (1 - foldProbability) * bet;
}

export function semiBluffEV(foldProbability: number, equityWhenCalled: number, pot: number, bet: number) {
  if (!valid(foldProbability, equityWhenCalled, pot, bet)) return 0;
  const called = 1 - foldProbability;
  return foldProbability * pot + called * (equityWhenCalled * (pot + bet) - (1 - equityWhenCalled) * bet);
}

export function outsApproxEquity(outs: number, cardsToCome: 1 | 2) {
  if (!valid(outs) || outs <= 0) return 0;
  return Math.min(1, (outs * (cardsToCome === 2 ? 4 : 2)) / 100);
}

export function exactOutsProbability(outs: number, unseenCards: number, cardsToCome: 1 | 2) {
  if (!valid(outs, unseenCards) || outs <= 0 || unseenCards <= 0 || outs > unseenCards) return 0;
  const missOne = (unseenCards - outs) / unseenCards;
  if (cardsToCome === 1 || unseenCards < 2) return 1 - missOne;
  const missTwo = ((unseenCards - outs) * (unseenCards - outs - 1)) / (unseenCards * (unseenCards - 1));
  return 1 - missTwo;
}

export function combinations(n: number, k: number) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) return 0;
  const m = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= m; i += 1) result = (result * (n - m + i)) / i;
  return result;
}

export function geometricBetSize(pot: number, effectiveStack: number, streets: number) {
  if (!valid(pot, effectiveStack, streets) || pot <= 0 || effectiveStack <= 0 || !Number.isInteger(streets) || streets <= 0) return 0;
  return (Math.pow(1 + (2 * effectiveStack) / pot, 1 / streets) - 1) / 2;
}

export function riskRewardAlpha(risk: number, reward: number) {
  if (!valid(risk, reward) || risk < 0 || reward < 0 || risk + reward === 0) return 0;
  return risk / (risk + reward);
}

export function bbPer100(profitBb: number, hands: number): MathResult {
  if (!valid(profitBb, hands) || hands <= 0) return { value: null, confidence: "INSUFFICIENT" };
  return { value: (profitBb / hands) * 100, confidence: "EXACT" };
}

export function standardError(standardDeviation: number, sampleSize: number): MathResult {
  if (!valid(standardDeviation, sampleSize) || standardDeviation < 0 || sampleSize < 2) return { value: null, confidence: "INSUFFICIENT" };
  return { value: standardDeviation / Math.sqrt(sampleSize), confidence: "EXACT" };
}

export function confidenceInterval95(mean: number, standardDeviation: number, sampleSize: number) {
  const se = standardError(standardDeviation, sampleSize);
  if (se.value === null) return { low: null, high: null, confidence: "INSUFFICIENT" as const };
  const margin = 1.96 * se.value;
  return { low: mean - margin, high: mean + margin, confidence: "ESTIMATE" as const };
}

export function kellyFraction(winProbability: number, decimalOdds: number): MathResult {
  if (!valid(winProbability, decimalOdds) || winProbability < 0 || winProbability > 1 || decimalOdds <= 1) return { value: null, confidence: "INSUFFICIENT" };
  const b = decimalOdds - 1;
  return { value: (b * winProbability - (1 - winProbability)) / b, confidence: "EXACT" };
}
