export type PokerDecision = {
  id?: string;
  spotId?: string;
  timestamp?: string;
  street: "preflop" | "flop" | "turn" | "river";
  position: string;
  villainPosition?: string;
  inPosition: boolean;
  stackBB: number;
  gameType?: "cash" | "tournament";
  action: "fold" | "check" | "call" | "bet" | "raise" | "3bet" | "4bet" | "allin";
  facingAggression: boolean;
  opportunity?:
    | "vpip"
    | "pfr"
    | "3bet"
    | "4bet"
    | "squeeze"
    | "blind-defense"
    | "cbet"
    | "fold-to-cbet"
    | "check-raise"
    | "probe"
    | "delayed-cbet"
    | "double-barrel"
    | "triple-barrel"
    | "overbet"
    | "bluff-catch"
    | "thin-value"
    | "value"
    | "bluff"
    | "shove"
    | "icm-pressure";
  correct?: boolean;
  tags?: string[];
};

export type MetricConfidence = "INSUFFICIENT" | "EARLY" | "DEVELOPING" | "ROBUST";

export type ProfileMetric = {
  value: number | null;
  opportunities: number;
  hits: number;
  confidence: MetricConfidence;
  label: string;
};

export type PlayerDNA = {
  sampleSize: number;
  robustness: ReturnType<typeof profileRobustnessLabel>;
  vpipFrequency: ProfileMetric;
  pfrFrequency: ProfileMetric;
  aggression: ProfileMetric;
  selectivity: ProfileMetric;
  callFrequency: ProfileMetric;
  foldFrequency: ProfileMetric;
  threeBetFrequency: ProfileMetric;
  fourBetFrequency: ProfileMetric;
  squeezeFrequency: ProfileMetric;
  blindDefense: ProfileMetric;
  inPositionAggression: ProfileMetric;
  outOfPositionAggression: ProfileMetric;
  cbetFrequency: ProfileMetric;
  foldToCbet: ProfileMetric;
  checkRaiseFrequency: ProfileMetric;
  probeFrequency: ProfileMetric;
  delayedCbetFrequency: ProfileMetric;
  doubleBarrelFrequency: ProfileMetric;
  tripleBarrelFrequency: ProfileMetric;
  overbetFrequency: ProfileMetric;
  bluffCatchFrequency: ProfileMetric;
  thinValueFrequency: ProfileMetric;
  valueAggression: ProfileMetric;
  bluffAggression: ProfileMetric;
  shoveFrequency: ProfileMetric;
  icmPressureDiscipline: ProfileMetric;
  discipline: ProfileMetric;
};

const DEFAULT_THRESHOLDS = { early: 10, developing: 30, robust: 100 };

function confidence(opportunities: number): MetricConfidence {
  if (opportunities < DEFAULT_THRESHOLDS.early) return "INSUFFICIENT";
  if (opportunities < DEFAULT_THRESHOLDS.developing) return "EARLY";
  if (opportunities < DEFAULT_THRESHOLDS.robust) return "DEVELOPING";
  return "ROBUST";
}

function metric(hits: number, opportunities: number, label: string): ProfileMetric {
  const state = confidence(opportunities);
  return {
    value: state === "INSUFFICIENT" || opportunities === 0 ? null : hits / opportunities,
    opportunities,
    hits,
    confidence: state,
    label,
  };
}

const aggressive = (a: PokerDecision["action"]) => ["bet", "raise", "3bet", "4bet", "allin"].includes(a);
const voluntaryPreflop = (a: PokerDecision["action"]) => ["call", "bet", "raise", "3bet", "4bet", "allin"].includes(a);
const preflopRaise = (a: PokerDecision["action"]) => ["raise", "3bet", "4bet", "allin"].includes(a);
const opportunity = (decisions: PokerDecision[], kind: PokerDecision["opportunity"]) => decisions.filter(d => d.opportunity === kind);
const aggressiveRate = (decisions: PokerDecision[], kind: PokerDecision["opportunity"], label: string) => {
  const opps = opportunity(decisions, kind);
  return metric(opps.filter(d => aggressive(d.action)).length, opps.length, label);
};

export function buildPlayerDNA(decisions: PokerDecision[]): PlayerDNA {
  const actions = decisions.length;
  const aggressiveCount = decisions.filter(d => aggressive(d.action)).length;
  const calls = decisions.filter(d => d.action === "call").length;
  const folds = decisions.filter(d => d.action === "fold").length;

  const vpipOpps = opportunity(decisions, "vpip");
  const vpipEntered = vpipOpps.filter(d => voluntaryPreflop(d.action)).length;
  const pfrOpps = opportunity(decisions, "pfr");
  const pfrRaises = pfrOpps.filter(d => preflopRaise(d.action)).length;
  const threeBetOpps = opportunity(decisions, "3bet");
  const fourBetOpps = opportunity(decisions, "4bet");
  const squeezeOpps = opportunity(decisions, "squeeze");
  const blindOpps = opportunity(decisions, "blind-defense");
  const foldToCbetOpps = opportunity(decisions, "fold-to-cbet");
  const bluffCatchOpps = opportunity(decisions, "bluff-catch");
  const thinValueOpps = opportunity(decisions, "thin-value");
  const valueOpps = opportunity(decisions, "value");
  const bluffOpps = opportunity(decisions, "bluff");
  const shoveOpps = opportunity(decisions, "shove");
  const icmOpps = opportunity(decisions, "icm-pressure");

  const ip = decisions.filter(d => d.inPosition);
  const oop = decisions.filter(d => !d.inPosition);
  const scored = decisions.filter(d => typeof d.correct === "boolean");
  const correct = scored.filter(d => d.correct).length;

  return {
    sampleSize: actions,
    robustness: profileRobustnessLabel(actions),
    vpipFrequency: metric(vpipEntered, vpipOpps.length, "VPIP"),
    pfrFrequency: metric(pfrRaises, pfrOpps.length, "PFR"),
    aggression: metric(aggressiveCount, actions, "AGRESSIVIDADE"),
    selectivity: metric(vpipOpps.length - vpipEntered, vpipOpps.length, "SELETIVIDADE"),
    callFrequency: metric(calls, actions, "FREQUÊNCIA DE CALL"),
    foldFrequency: metric(folds, actions, "FREQUÊNCIA DE FOLD"),
    threeBetFrequency: metric(threeBetOpps.filter(d => d.action === "3bet").length, threeBetOpps.length, "3-BET"),
    fourBetFrequency: metric(fourBetOpps.filter(d => d.action === "4bet").length, fourBetOpps.length, "4-BET"),
    squeezeFrequency: metric(squeezeOpps.filter(d => ["3bet", "4bet", "allin"].includes(d.action)).length, squeezeOpps.length, "SQUEEZE"),
    blindDefense: metric(blindOpps.filter(d => d.action !== "fold").length, blindOpps.length, "DEFESA DE BLINDS"),
    inPositionAggression: metric(ip.filter(d => aggressive(d.action)).length, ip.length, "AGRESSIVIDADE IP"),
    outOfPositionAggression: metric(oop.filter(d => aggressive(d.action)).length, oop.length, "AGRESSIVIDADE OOP"),
    cbetFrequency: aggressiveRate(decisions, "cbet", "C-BET"),
    foldToCbet: metric(foldToCbetOpps.filter(d => d.action === "fold").length, foldToCbetOpps.length, "FOLD TO C-BET"),
    checkRaiseFrequency: aggressiveRate(decisions, "check-raise", "CHECK-RAISE"),
    probeFrequency: aggressiveRate(decisions, "probe", "PROBE"),
    delayedCbetFrequency: aggressiveRate(decisions, "delayed-cbet", "DELAYED C-BET"),
    doubleBarrelFrequency: aggressiveRate(decisions, "double-barrel", "DOUBLE BARREL"),
    tripleBarrelFrequency: aggressiveRate(decisions, "triple-barrel", "TRIPLE BARREL"),
    overbetFrequency: aggressiveRate(decisions, "overbet", "OVERBET"),
    bluffCatchFrequency: metric(bluffCatchOpps.filter(d => d.action === "call").length, bluffCatchOpps.length, "BLUFF CATCH"),
    thinValueFrequency: metric(thinValueOpps.filter(d => aggressive(d.action)).length, thinValueOpps.length, "THIN VALUE"),
    valueAggression: metric(valueOpps.filter(d => aggressive(d.action)).length, valueOpps.length, "AGRESSÃO POR VALOR"),
    bluffAggression: metric(bluffOpps.filter(d => aggressive(d.action)).length, bluffOpps.length, "AGRESSÃO EM BLUFF"),
    shoveFrequency: metric(shoveOpps.filter(d => d.action === "allin").length, shoveOpps.length, "SHOVE"),
    icmPressureDiscipline: metric(icmOpps.filter(d => d.correct === true).length, icmOpps.filter(d => typeof d.correct === "boolean").length, "DISCIPLINA SOB ICM"),
    discipline: metric(correct, scored.length, "DISCIPLINA"),
  };
}

export function profileRobustnessLabel(sampleSize: number) {
  if (sampleSize >= 3000) return "ANÁLISE PROFUNDA" as const;
  if (sampleSize >= 1000) return "ALTA ROBUSTEZ" as const;
  if (sampleSize >= 500) return "ANÁLISE AVANÇADA" as const;
  if (sampleSize >= 300) return "ANÁLISE INTERMEDIÁRIA" as const;
  if (sampleSize >= 100) return "PERFIL INICIAL" as const;
  return "COLETA EM ANDAMENTO" as const;
}

export function formatProfileMetric(metric: ProfileMetric) {
  if (metric.value === null) return "DADOS INSUFICIENTES";
  return `${(metric.value * 100).toFixed(1)}%`;
}

export function profileProgress(sampleSize: number) {
  const milestones = [100, 300, 500, 1000, 3000];
  const next = milestones.find(value => sampleSize < value) ?? 3000;
  return {
    current: sampleSize,
    next,
    percentToNext: next > 0 ? Math.min(1, sampleSize / next) : 1,
    completeDeepProfile: sampleSize >= 3000,
  };
}
