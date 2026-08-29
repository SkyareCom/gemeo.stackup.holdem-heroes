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
    dna.vpipFrequency,
    dna.pfrFrequency,
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
  const vpip = value(dna.vpipFrequency);
  const pfr = value(dna.pfrFrequency);
  const agg = value(dna.aggression);
  const calls = value(dna.callFrequency);
  const folds = value(dna.foldFrequency);
  const threeBet = value(dna.threeBetFrequency);
  const bluff = value(dna.bluffAggression);
  const valueAgg = value(dna.valueAggression);

  if ([vpip, pfr, agg, calls, folds].some(metric => metric === null) || readiness.readyMetrics < 8) {
    return { archetype: "UNDETERMINED", confidence: readiness.ratio, reasons: ["Amostra ainda insuficiente para classificar o estilo sem forçar precisão."] };
  }

  const vpi = vpip as number;
  const pf = pfr as number;
  const a = agg as number;
  const c = calls as number;
  const f = folds as number;
  const t = threeBet ?? 0;
  const b = bluff ?? 0;
  const va = valueAgg ?? a;
  const gap = Math.max(0, vpi - pf);

  const loose = vpi > 0.33;
  const tight = vpi < 0.22;
  const aggressive = a > 0.43 || pf > 0.24 || t > 0.10;
  const passive = a < 0.28 || gap > 0.16;
  const highCall = c > 0.36 || gap > 0.18;
  const highFold = f > 0.48;
  const extremeAggression = a > 0.62 || b > 0.62 || (pf > 0.34 && t > 0.14);

  let archetype: PlayerArchetype = "BALANCED";
  const reasons: string[] = [];

  if (extremeAggression && !tight) {
    archetype = "OVERAGGRESSIVE";
    reasons.push("Pressão agressiva extrema em relação à participação observada.");
  } else if (tight && highFold && passive) {
    archetype = "NIT";
    reasons.push("VPIP baixo, folds elevados e pouca iniciativa agressiva.");
  } else if (loose && highCall && passive) {
    archetype = "CALLING STATION";
    reasons.push("VPIP alto, gap VPIP/PFR amplo e frequência elevada de calls.");
  } else if (tight && passive) {
    archetype = "TIGHT PASSIVE";
    reasons.push("Participação restrita com pouca conversão de VPIP em agressão pré-flop.");
  } else if (loose && passive) {
    archetype = "LOOSE PASSIVE";
    reasons.push("Participação ampla com gap VPIP/PFR e agressividade insuficiente.");
  } else if (tight && aggressive) {
    archetype = "TAG";
    reasons.push("VPIP controlado, PFR proporcional e agressão consistente.");
  } else if (loose && aggressive) {
    archetype = "LAG";
    reasons.push("VPIP amplo acompanhado de PFR e pressão agressiva frequentes.");
  } else {
    reasons.push("VPIP, PFR e agressão permanecem em faixas intermediárias sem desvio extremo.");
    if (Math.abs(va - b) < 0.2) reasons.push("Agressão por valor e bluff não apresenta desequilíbrio extremo detectável.");
  }

  const confidence = Math.min(1, readiness.ratio * (dna.sampleSize >= 1000 ? 1 : dna.sampleSize >= 500 ? 0.9 : dna.sampleSize >= 300 ? 0.8 : 0.65));
  return { archetype, confidence, reasons };
}
