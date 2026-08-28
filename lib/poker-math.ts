export const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

export function requiredEquity(potBeforeBet: number, villainBet: number, call: number = villainBet) {
  const finalPot = potBeforeBet + villainBet + call;
  return call / finalPot;
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

export function outsApproxEquity(outs: number, cardsToCome: 1 | 2) {
  return Math.min(1, (outs * (cardsToCome === 2 ? 4 : 2)) / 100);
}
