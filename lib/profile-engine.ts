export type PokerDecision = {
  street: "preflop" | "flop" | "turn" | "river";
  position: string;
  inPosition: boolean;
  stackBB: number;
  action: "fold" | "check" | "call" | "bet" | "raise" | "3bet" | "4bet" | "allin";
  facingAggression: boolean;
  opportunity?: "vpip" | "pfr" | "3bet" | "blind-defense" | "bluff-catch" | "value" | "bluff";
};

export type PlayerDNA = {
  sampleSize: number;
  aggression: number | null;
  selectivity: number | null;
  callFrequency: number | null;
  foldFrequency: number | null;
  threeBetFrequency: number | null;
  blindDefense: number | null;
  inPositionAggression: number | null;
  outOfPositionAggression: number | null;
};

const ratio = (hits: number, opportunities: number) => opportunities ? hits / opportunities : null;
const aggressive = (a: PokerDecision["action"]) => ["bet","raise","3bet","4bet","allin"].includes(a);

export function buildPlayerDNA(decisions: PokerDecision[]): PlayerDNA {
  const actions = decisions.length;
  const aggressiveCount = decisions.filter(d => aggressive(d.action)).length;
  const calls = decisions.filter(d => d.action === "call").length;
  const folds = decisions.filter(d => d.action === "fold").length;
  const threeBetOpps = decisions.filter(d => d.opportunity === "3bet");
  const blindOpps = decisions.filter(d => d.opportunity === "blind-defense");
  const ip = decisions.filter(d => d.inPosition);
  const oop = decisions.filter(d => !d.inPosition);
  const vpipOpps = decisions.filter(d => d.opportunity === "vpip");
  const vpipEntered = vpipOpps.filter(d => d.action !== "fold").length;

  return {
    sampleSize: actions,
    aggression: ratio(aggressiveCount, actions),
    selectivity: vpipOpps.length ? 1 - (vpipEntered / vpipOpps.length) : null,
    callFrequency: ratio(calls, actions),
    foldFrequency: ratio(folds, actions),
    threeBetFrequency: ratio(threeBetOpps.filter(d => d.action === "3bet").length, threeBetOpps.length),
    blindDefense: ratio(blindOpps.filter(d => d.action !== "fold").length, blindOpps.length),
    inPositionAggression: ratio(ip.filter(d => aggressive(d.action)).length, ip.length),
    outOfPositionAggression: ratio(oop.filter(d => aggressive(d.action)).length, oop.length),
  };
}

export function profileRobustnessLabel(sampleSize: number) {
  if (sampleSize >= 3000) return "ANÁLISE PROFUNDA";
  if (sampleSize >= 1000) return "ALTA ROBUSTEZ";
  if (sampleSize >= 500) return "ANÁLISE AVANÇADA";
  if (sampleSize >= 300) return "ANÁLISE INTERMEDIÁRIA";
  return "PERFIL INICIAL";
}
