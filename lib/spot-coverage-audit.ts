import { PROFILE_OPPORTUNITIES } from "../data/training-spots";
import { describeCoverage, type SpotDescriptor } from "./spot-sampler";

export type CoverageAudit = {
  requested: number;
  actual: number;
  targetPerOpportunity: number;
  representedOpportunities: number;
  totalOpportunities: number;
  missing: string[];
  belowTarget: { opportunity: string; count: number; target: number }[];
  pass: boolean;
};

export function targetPerDiagnosticOpportunity(requested: number) {
  if (requested >= 3000) return 100;
  if (requested >= 1000) return 30;
  if (requested >= 500) return 20;
  if (requested >= 300) return 10;
  if (requested >= 100) return 2;
  return 1;
}

export function auditSpotSample(spots: SpotDescriptor[], requested = spots.length): CoverageAudit {
  const coverage = describeCoverage(spots);
  const target = targetPerDiagnosticOpportunity(requested);
  const missing = PROFILE_OPPORTUNITIES.filter(key => (coverage.actionOpportunity[key] ?? 0) === 0);
  const belowTarget = PROFILE_OPPORTUNITIES
    .map(opportunity => ({ opportunity, count: coverage.actionOpportunity[opportunity] ?? 0, target }))
    .filter(item => item.count < target);

  return {
    requested,
    actual: spots.length,
    targetPerOpportunity: target,
    representedOpportunities: PROFILE_OPPORTUNITIES.length - missing.length,
    totalOpportunities: PROFILE_OPPORTUNITIES.length,
    missing: [...missing],
    belowTarget,
    pass: missing.length === 0 && belowTarget.length === 0,
  };
}

export function auditTrainingBank(bank: SpotDescriptor[]) {
  const coverage = describeCoverage(bank);
  const robustTarget = 100;
  const perOpportunity = PROFILE_OPPORTUNITIES.map(opportunity => ({
    opportunity,
    available: coverage.actionOpportunity[opportunity] ?? 0,
    supportsRobustMetric: (coverage.actionOpportunity[opportunity] ?? 0) >= robustTarget,
  }));

  return {
    totalSpots: bank.length,
    allOpportunitiesRepresented: perOpportunity.every(item => item.available > 0),
    allOpportunitiesSupportRobustMetric: perOpportunity.every(item => item.supportsRobustMetric),
    perOpportunity,
  };
}
