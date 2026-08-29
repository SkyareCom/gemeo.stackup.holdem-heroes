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
  opportunity?: "vpip" | "pfr" | "3bet" | "4bet" | "blind-defense" | "bluff-catch" | "value" | "bluff";
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
  aggression: ProfileMetric;
  selectivity: ProfileMetric;
  callFrequency: ProfileMetric;
  foldFrequency: ProfileMetric;
  threeBetFrequency: ProfileMetric;
  fourBetFrequency: ProfileMetric;
  blindDefense: ProfileMetric;
  inPositionAggression: ProfileMetric;
  outOfPositionAggression: ProfileMetric;
  bluffCatchFrequency: ProfileMetric;
  valueAggression: ProfileMetric;
  bluffAggression: ProfileMetric;
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

export function buildPlayerDNA(decisions: PokerDecision[]): PlayerDNA {
  const actions = decisions.length;
  const aggressiveCount = decisions.filter(d => aggressive(d.action)).length;
  const calls = decisions.filter(d => d.action === "call").length;
  const folds = decisions.filter(d => d.action === "fold").length;

  const vpipOpps = decisions.filter(d => d.opportunity === "vpip");
  const vpipEntered = vpipOpps.filter(d => voluntaryPreflop(d.action)).length;
  const threeBetOpps = decisions.filter(d => d.opportunity === "3bet");
  const fourBetOpps = decisions.filter(d => d.opportunity === "4bet");
  const blindOpps = decisions.filter(d => d.opportunity === "blind-defense");
  const bluffCatchOpps = decisions.filter(d => d.opportunity === "bluff-catch");
  const valueOpps = decisions.filter(d => d.opportunity === "value");
  const bluffOpps = decisions.filter(d => d.opportunity === "bluff");

  const ip = decisions.filter(d => d.inPosition);
  const oop = decisions.filter(d => !d.inPosition);
  const scored = decisions.filter(d => typeof d.correct === "boolean");
  const correct = scored.filter(d => d.correct).length;

  return {
    sampleSize: actions,
    robustness: profileRobustnessLabel(actions),
    aggression: metric(aggressiveCount, actions, "AGRESSIVIDADE"),
    selectivity: metric(vpipOpps.length - vpipEntered, vpipOpps.length, "SELETIVIDADE"),
    callFrequency: metric(calls, actions, "FREQUÊNCIA DE CALL"),
    foldFrequency: metric(folds, actions, "FREQUÊNCIA DE FOLD"),
    threeBetFrequency: metric(threeBetOpps.filter(d => d.action === "3bet").length, threeBetOpps.length, "3-BET"),
    fourBetFrequency: metric(fourBetOpps.filter(d => d.action === "4bet").length, fourBetOpps.length, "4-BET"),
    blindDefense: metric(blindOpps.filter(d => d.action !== "fold").length, blindOpps.length, "DEFESA DE BLINDS"),
    inPositionAggression: metric(ip.filter(d => aggressive(d.action)).length, ip.length, "AGRESSIVIDADE IP"),
    outOfPositionAggression: metric(oop.filter(d => aggressive(d.action)).length, oop.length, "AGRESSIVIDADE OOP"),
    bluffCatchFrequency: metric(bluffCatchOpps.filter(d => d.action === "call").length, bluffCatchOpps.length, "BLUFF CATCH"),
    valueAggression: metric(valueOpps.filter(d => aggressive(d.action)).length, valueOpps.length, "AGRESSÃO POR VALOR"),
    bluffAggression: metric(bluffOpps.filter(d => aggressive(d.action)).length, bluffOpps.length, "AGRESSÃO EM BLUFF"),
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
