import type { PlayerDNA, ProfileMetric } from "./profile-engine";

export type PlayerArchetype =
  | "TAG"
  | "LAG"
  | "NIT"
  | "CALLING STATION"
  | "TIGHT PASSIVE"
  | "LOOSE PASSIVE"
  | "OVERAGGRESSIVE"
  | "BALANCED"
  | "UNDETERMINED";

export type DiagnosticReadiness = {
  readyMetrics: number;
  totalMetrics: number;
  robustMetrics: number;
  ratio: number;
  label: "COLETA INICIAL" | "DIAGNÓSTICO PARCIAL" | "DIAGNÓSTICO CONSISTENTE" | "DIAGNÓSTICO ROBUSTO";
  missing: string[];
};

const value = (metric: ProfileMetric) => metric.value;
const usable = (metric: ProfileMetric) => metric.value !== null;

export function profileMetrics(dna: PlayerDNA): ProfileMetric[] {
  return [
    dna.aggression,
    dna.selectivity,
    dna.callFrequency,
    dna.foldFrequency,
    dna.threeBetFrequency,
    dna.fourBetFrequency,
    dna.squeezeFrequency,
    dna.blindDefense,
    dna.inPositionAggression,
    dna.outOfPositionAggression,
    dna.cbetFrequency,
    dna.foldToCbet,
    dna.checkRaiseFrequency,
    dna.probeFrequency,
    dna.delayedCbetFrequency,
    dna.doubleBarrelFrequency,
    dna.tripleBarrelFrequency,
    dna.overbetFrequency,
    dna.bluffCatchFrequency,
    dna.thinValueFrequency,
    dna.valueAggression,
    dna.bluffAggression,
    dna.shoveFrequency,
    dna.icmPressureDiscipline,
    dna.discipline,
  ];
}

export function diagnosticReadiness(dna: PlayerDNA): DiagnosticReadiness {
  const metrics = profileMetrics(dna);
  const ready = metrics.filter(usable);
  const robust = metrics.filter(metric => metric.confidence === "ROBUST");
  const ratio = metrics.length ? ready.length / metrics.length : 0;
  const label = ratio >= 0.9 && robust.length >= Math.floor(metrics.length * 0.7)
    ? "DIAGNÓSTICO ROBUSTO"
    : ratio >= 0.75
      ? "DIAGNÓSTICO CONSISTENTE"
      : ratio >= 0.4
        ? "DIAGNÓSTICO PARCIAL"
        : "COLETA INICIAL";

  return {
    readyMetrics: ready.length,
    totalMetrics: metrics.length,
    robustMetrics: robust.length,
    ratio,
    label,
    missing: metrics.filter(metric => !usable(metric)).map(metric => metric.label),
  };
}

export function classifyPlayerArchetype(dna: PlayerDNA): { archetype: PlayerArchetype; confidence: number; reasons: string[] } {
  const readiness = diagnosticReadiness(dna);
  const agg = value(dna.aggression);
  const selective = value(dna.selectivity);
  const calls = value(dna.callFrequency);
  const folds = value(dna.foldFrequency);
  const threeBet = value(dna.threeBetFrequency);
  const bluff = value(dna.bluffAggression);
  const valueAgg = value(dna.valueAggression);

  if ([agg, selective, calls, folds].some(metric => metric === null) || readiness.readyMetrics < 6) {
    return { archetype: "UNDETERMINED", confidence: readiness.ratio, reasons: ["Amostra ainda insuficiente para classificar o estilo sem forçar precisão."] };
  }

  const a = agg as number;
  const s = selective as number;
  const c = calls as number;
  const f = folds as number;
  const t = threeBet ?? 0;
  const b = bluff ?? 0;
  const v = valueAgg ?? a;
  const loose = s < 0.48;
  const tight = s > 0.62;
  const aggressive = a > 0.43 || t > 0.10;
  const passive = a < 0.28;
  const highCall = c > 0.36;
  const highFold = f > 0.48;
  const extremeAggression = a > 0.62 || b > 0.62;

  let archetype: PlayerArchetype = "BALANCED";
  const reasons: string[] = [];

  if (extremeAggression && !tight) {
    archetype = "OVERAGGRESSIVE";
    reasons.push("Frequência de agressão muito elevada para a seletividade observada.");
  } else if (tight && highFold && passive) {
    archetype = "NIT";
    reasons.push("Alta seletividade, excesso de folds e baixa agressão.");
  } else if (loose && highCall && passive) {
    archetype = "CALLING STATION";
    reasons.push("Entrada ampla em pots, muitos calls e pouca agressão.");
  } else if (tight && passive) {
    archetype = "TIGHT PASSIVE";
    reasons.push("Seleção restrita de mãos com baixa iniciativa agressiva.");
  } else if (loose && passive) {
    archetype = "LOOSE PASSIVE";
    reasons.push("Range amplo combinado com baixa agressão.");
  } else if (tight && aggressive) {
    archetype = "TAG";
    reasons.push("Seleção disciplinada combinada com agressão consistente.");
  } else if (loose && aggressive) {
    archetype = "LAG";
    reasons.push("Participação ampla combinada com pressão agressiva frequente.");
  } else {
    reasons.push("Frequências centrais sem desvio extremo para tight/loose ou passivo/agressivo.");
    if (Math.abs(v - b) < 0.2) reasons.push("Relação entre agressão por valor e bluff sem desequilíbrio extremo detectado.");
  }

  const confidence = Math.min(1, readiness.ratio * (dna.sampleSize >= 1000 ? 1 : dna.sampleSize >= 500 ? 0.9 : dna.sampleSize >= 300 ? 0.8 : 0.65));
  return { archetype, confidence, reasons };
}
