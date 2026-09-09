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
  status: string;
  solver_best?: PlayerAction;
  solver_frequency_pct?: Partial<Record<PlayerAction, number>>;
  [key: string]: unknown;
};

type Report = {
  cases: SolverCase[];
  solved?: number;
  top_action_matches?: number;
  top_action_match_pct?: number | null;
  by_street?: Record<string, { solved: number; matches: number; match_pct?: number | null }>;
  by_texture?: Record<string, { solved: number; matches: number; match_pct?: number | null }>;
  comparison_method?: string;
  [key: string]: unknown;
};

function spacedCards(text: string) {
  return text.split(",").join(" ");
}

function actionsFor(path: string[]): PlayerAction[] {
  const last = (path.at(-1) ?? "CHECK").toUpperCase();
  if (last.startsWith("BET") || last.startsWith("RAISE")) {
    return ["FOLD", "CALL", "RAISE", "ALL-IN"];
  }
  return ["CHECK", "BET", "RAISE", "ALL-IN"];
}

function makeSpot(row: SolverCase): PlayerDnaSpot {
  const finalAction = (row.path.at(-1) ?? "CHECK").toUpperCase();
  const facingAggression = finalAction.startsWith("BET") || finalAction.startsWith("RAISE");
  const villainValue = facingAggression ? Math.max(1, Math.round(row.pot * 0.5)) : 0;
  const isTournament = row.id.startsWith("mtt-");

  return {
    id: `benchmark-${row.id}`,
    mode: isTournament ? "TORNEIO" : "CASH",
    street: row.street.toUpperCase() as PlayerDnaSpot["street"],
    heroCards: `${row.hero.slice(0, 2)} ${row.hero.slice(2)}`,
    board: spacedCards(row.board),
    players: [
      { position: "HERO", stack: row.stack, action: "AGUARDA", value: 0, hero: true },
      { position: "VILAO", stack: row.stack, action: finalAction, value: villainValue },
    ],
    pot: { main: row.pot },
    scenario: [isTournament ? "TORNEIO" : "CASH", "HU", "CHIP EV"],
    prompt: "Benchmark TexasSolver",
    actions: actionsFor(row.path),
    weights: {},
  };
}

function bestAction(freq: Partial<Record<PlayerAction, number>>) {
  const entries = Object.entries(freq) as [PlayerAction, number][];
  if (!entries.length) return undefined;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function recomputeBuckets(report: Report) {
  const ok = report.cases.filter((row) => row.status === "ok" && row.app_engine_best);
  const matched = ok.filter((row) => row.top_action_match === true);
  report.solved = ok.length;
  report.top_action_matches = matched.length;
  report.top_action_match_pct = ok.length ? Math.round((10000 * matched.length) / ok.length) / 100 : null;

  const byStreet: Record<string, { solved: number; matches: number; match_pct?: number | null }> = {};
  const byTexture: Record<string, { solved: number; matches: number; match_pct?: number | null }> = {};
  for (const row of ok) {
    const street = String(row.street);
    const texture = String(row.texture ?? "unknown");
    for (const [bucket, key] of [[byStreet, street], [byTexture, texture]] as const) {
      bucket[key] ??= { solved: 0, matches: 0 };
      bucket[key].solved += 1;
      bucket[key].matches += row.top_action_match === true ? 1 : 0;
    }
  }
  for (const bucket of [byStreet, byTexture]) {
    for (const stats of Object.values(bucket)) {
      stats.match_pct = stats.solved ? Math.round((10000 * stats.matches) / stats.solved) / 100 : null;
    }
  }
  report.by_street = byStreet;
  report.by_texture = byTexture;
}

const reportPath = process.argv[2];
if (!reportPath) throw new Error("usage: compare_app_engine.ts <summary.json>");

const report = JSON.parse(fs.readFileSync(reportPath, "utf8")) as Report;
for (const row of report.cases) {
  if (row.status !== "ok" || !row.solver_best) continue;
  const strategy = solverHeroNodeStrategy(makeSpot(row));
  const appBest = bestAction(strategy);
  row.manual_expected_app = row.expected_app;
  row.app_engine_frequency_pct = strategy;
  row.app_engine_best = appBest;
  row.top_action_match = appBest === row.solver_best;
  delete row.app_expected;
}

report.comparison_method = "TexasSolver solver_best versus live solverHeroNodeStrategy() from lib/gto-range-policy.ts";
recomputeBuckets(report);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  solved: report.solved,
  top_action_matches: report.top_action_matches,
  top_action_match_pct: report.top_action_match_pct,
  comparison_method: report.comparison_method,
}, null, 2));
