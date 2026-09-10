import fs from "node:fs";
import { solverHeroNodeStrategy } from "../../lib/gto-range-policy";
import type { PlayerAction, PlayerDnaSpot } from "../../data/player-dna-spots";

type SolverCase = {
  id: string;
  street: "flop" | "turn" | "river";
  board: string;
  pot: number;
  stack: number;
  hero: string;
  path: string[];
  resolved_path?: string[];
  position_state?: "IP" | "OOP";
  status: string;
  solver_best?: PlayerAction;
  solver_frequency_pct?: Partial<Record<PlayerAction, number>>;
  expected_app?: PlayerAction;
  texture?: string;
  app_engine_best?: PlayerAction;
  top_action_match?: boolean;
  solver_accepts_app_line?: boolean;
  total_variation_distance_pct?: number;
  [key: string]: unknown;
};

type BucketStats = { solved: number; matches: number; acceptable: number; match_pct?: number | null; acceptable_pct?: number | null; avg_tvd_pct?: number | null; tvd_sum?: number };

type Report = {
  cases: SolverCase[];
  case_count?: number;
  solved?: number;
  top_action_matches?: number;
  top_action_match_pct?: number | null;
  solver_acceptable_app_lines?: number;
  solver_acceptable_app_line_pct?: number | null;
  avg_total_variation_distance_pct?: number | null;
  solver_coverage_pct?: number | null;
  fidelity_gate_passed?: boolean;
  fidelity_gate?: { min_coverage_pct: number; min_top_action_pct_exclusive: number; max_avg_tvd_pct: number };
  by_street?: Record<string, BucketStats>;
  by_texture?: Record<string, BucketStats>;
  comparison_method?: string;
  [key: string]: unknown;
};

const ACTIONS: PlayerAction[] = ["FOLD", "CHECK", "CALL", "BET", "RAISE", "ALL-IN"];
const ACCEPTABLE_SOLVER_FREQUENCY_PCT = 20;
const MIN_COVERAGE_PCT = 100;
const MIN_TOP_ACTION_PCT_EXCLUSIVE = 98;
const MAX_AVG_TVD_PCT = 5;

function spacedCards(text: string) {
  return text.split(",").join(" ");
}

function actionFamily(value: string) {
  const u = value.toUpperCase().replaceAll("_", "-");
  if (u.startsWith("BET")) return "BET";
  if (u.startsWith("RAISE")) return "RAISE";
  if (u.startsWith("ALLIN") || u.startsWith("ALL-IN") || u.startsWith("ALL IN")) return "ALL-IN";
  if (u.startsWith("CALL")) return "CALL";
  if (u.startsWith("CHECK")) return "CHECK";
  if (u.startsWith("FOLD")) return "FOLD";
  return u.split(" ")[0];
}

function actionAmount(value: string | undefined) {
  if (!value) return 0;
  const match = value.match(/(-?\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function actionsFor(path: string[]): PlayerAction[] {
  const last = actionFamily(path.at(-1) ?? "CHECK");
  if (last === "BET" || last === "RAISE" || last === "ALL-IN") {
    return ["FOLD", "CALL", "RAISE", "ALL-IN"];
  }
  return ["CHECK", "BET", "RAISE", "ALL-IN"];
}

function makeSpot(row: SolverCase): PlayerDnaSpot {
  const resolved = row.resolved_path?.length ? row.resolved_path : row.path;
  const finalActionRaw = resolved.at(-1) ?? "CHECK";
  const finalFamily = actionFamily(finalActionRaw);
  const facingAggression = finalFamily === "BET" || finalFamily === "RAISE" || finalFamily === "ALL-IN";
  const exactAmount = actionAmount(finalActionRaw);
  const villainValue = facingAggression ? (exactAmount > 0 ? exactAmount : Math.max(1, Math.round(row.pot * 0.5))) : 0;
  const isTournament = row.id.startsWith("mtt-");
  const positionState = row.position_state ?? (row.id.includes("-oop") ? "OOP" : row.id.includes("-ip") ? "IP" : undefined);

  return {
    id: `benchmark-${row.id}`,
    mode: isTournament ? "TORNEIO" : "CASH",
    street: row.street.toUpperCase() as PlayerDnaSpot["street"],
    heroCards: `${row.hero.slice(0, 2)} ${row.hero.slice(2)}`,
    board: spacedCards(row.board),
    players: [
      { position: positionState === "OOP" ? "OOP-HERO" : "IP-HERO", stack: row.stack, action: "AGUARDA", value: 0, hero: true },
      { position: positionState === "OOP" ? "IP-VILAO" : "OOP-VILAO", stack: row.stack, action: finalFamily, value: villainValue },
    ],
    pot: { main: row.pot },
    scenario: [isTournament ? "TORNEIO" : "CASH", "HU", "CHIP EV", ...(positionState ? [positionState] : [])],
    prompt: "Benchmark TexasSolver",
    actions: actionsFor(resolved),
    weights: {},
  };
}

function bestAction(freq: Partial<Record<PlayerAction, number>>) {
  const entries = Object.entries(freq) as [PlayerAction, number][];
  if (!entries.length) return undefined;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function pct(freq: Partial<Record<PlayerAction, number>> | undefined, action: PlayerAction) {
  return Number(freq?.[action] ?? 0);
}

function totalVariationDistancePct(
  solver: Partial<Record<PlayerAction, number>>,
  app: Partial<Record<PlayerAction, number>>,
) {
  const l1 = ACTIONS.reduce((sum, action) => sum + Math.abs(pct(solver, action) - pct(app, action)), 0);
  return Math.round((l1 / 2) * 100) / 100;
}

function recomputeBuckets(report: Report) {
  const ok = report.cases.filter((row) => row.status === "ok" && row.app_engine_best);
  const matched = ok.filter((row) => row.top_action_match === true);
  const acceptable = ok.filter((row) => row.solver_accepts_app_line === true);
  const tvds = ok.map((row) => Number(row.total_variation_distance_pct)).filter(Number.isFinite);
  const caseCount = Number(report.case_count ?? report.cases.length);

  report.solved = ok.length;
  report.top_action_matches = matched.length;
  report.top_action_match_pct = ok.length ? Math.round((10000 * matched.length) / ok.length) / 100 : null;
  report.solver_acceptable_app_lines = acceptable.length;
  report.solver_acceptable_app_line_pct = ok.length ? Math.round((10000 * acceptable.length) / ok.length) / 100 : null;
  report.avg_total_variation_distance_pct = tvds.length ? Math.round((100 * tvds.reduce((a, b) => a + b, 0)) / tvds.length) / 100 : null;
  report.solver_coverage_pct = caseCount ? Math.round((10000 * ok.length) / caseCount) / 100 : null;
  report.fidelity_gate = { min_coverage_pct: MIN_COVERAGE_PCT, min_top_action_pct_exclusive: MIN_TOP_ACTION_PCT_EXCLUSIVE, max_avg_tvd_pct: MAX_AVG_TVD_PCT };
  report.fidelity_gate_passed = Number(report.solver_coverage_pct ?? 0) >= MIN_COVERAGE_PCT
    && Number(report.top_action_match_pct ?? 0) > MIN_TOP_ACTION_PCT_EXCLUSIVE
    && Number(report.avg_total_variation_distance_pct ?? 999) <= MAX_AVG_TVD_PCT;

  const byStreet: NonNullable<Report["by_street"]> = {};
  const byTexture: NonNullable<Report["by_texture"]> = {};
  for (const row of ok) {
    const street = String(row.street);
    const texture = String(row.texture ?? "unknown");
    const tvd = Number(row.total_variation_distance_pct ?? 0);
    for (const [bucket, key] of [[byStreet, street], [byTexture, texture]] as const) {
      bucket[key] ??= { solved: 0, matches: 0, acceptable: 0, tvd_sum: 0 };
      bucket[key].solved += 1;
      bucket[key].matches += row.top_action_match === true ? 1 : 0;
      bucket[key].acceptable += row.solver_accepts_app_line === true ? 1 : 0;
      bucket[key].tvd_sum = Number(bucket[key].tvd_sum ?? 0) + tvd;
    }
  }
  for (const bucket of [byStreet, byTexture]) {
    for (const stats of Object.values(bucket)) {
      stats.match_pct = stats.solved ? Math.round((10000 * stats.matches) / stats.solved) / 100 : null;
      stats.acceptable_pct = stats.solved ? Math.round((10000 * stats.acceptable) / stats.solved) / 100 : null;
      stats.avg_tvd_pct = stats.solved ? Math.round((100 * Number(stats.tvd_sum ?? 0)) / stats.solved) / 100 : null;
      delete stats.tvd_sum;
    }
  }
  report.by_street = byStreet;
  report.by_texture = byTexture;
}

const reportPath = process.argv[2];
if (!reportPath) throw new Error("usage: compare_app_engine.ts <summary.json>");

const report = JSON.parse(fs.readFileSync(reportPath, "utf8")) as Report;
for (const row of report.cases) {
  if (row.status !== "ok" || !row.solver_best || !row.solver_frequency_pct) continue;
  const strategy = solverHeroNodeStrategy(makeSpot(row));
  const appBest = bestAction(strategy);
  const solverFreqForAppBest = appBest ? pct(row.solver_frequency_pct, appBest) : 0;

  row.manual_expected_app = row.expected_app;
  row.app_engine_frequency_pct = strategy;
  row.app_engine_best = appBest;
  row.top_action_match = appBest === row.solver_best;
  row.solver_frequency_for_app_best_pct = Math.round(solverFreqForAppBest * 100) / 100;
  row.solver_accepts_app_line = solverFreqForAppBest >= ACCEPTABLE_SOLVER_FREQUENCY_PCT;
  row.total_variation_distance_pct = totalVariationDistancePct(row.solver_frequency_pct, strategy);
  delete row.app_expected;
}

report.comparison_method = `TexasSolver action frequencies versus live solverHeroNodeStrategy(); acceptable app line means solver frequency >= ${ACCEPTABLE_SOLVER_FREQUENCY_PCT}%; fidelity gate requires ${MIN_COVERAGE_PCT}% solved coverage, >${MIN_TOP_ACTION_PCT_EXCLUSIVE}% top-action agreement and <=${MAX_AVG_TVD_PCT}% average TVD`;
recomputeBuckets(report);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  solved: report.solved,
  solver_coverage_pct: report.solver_coverage_pct,
  top_action_matches: report.top_action_matches,
  top_action_match_pct: report.top_action_match_pct,
  solver_acceptable_app_lines: report.solver_acceptable_app_lines,
  solver_acceptable_app_line_pct: report.solver_acceptable_app_line_pct,
  avg_total_variation_distance_pct: report.avg_total_variation_distance_pct,
  fidelity_gate_passed: report.fidelity_gate_passed,
  fidelity_gate: report.fidelity_gate,
  comparison_method: report.comparison_method,
}, null, 2));

if (!report.fidelity_gate_passed) {
  console.error("TexasSolver fidelity gate failed; refusing to treat this calibration run as validated.");
  process.exitCode = 2;
}
