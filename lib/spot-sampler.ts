export type Street = "preflop" | "flop" | "turn" | "river";
export type Position = "UTG" | "MP" | "HJ" | "CO" | "BTN" | "SB" | "BB";
export type StackBucket = "short" | "medium" | "deep";
export type PotType = "limped" | "srp" | "3bet" | "4bet";
export type PlayerCount = "heads-up" | "multiway";
export type GameType = "cash" | "tournament";
export type BoardTexture = "none" | "dry" | "wet" | "paired" | "monotone" | "connected";

export type SpotDescriptor = {
  id: string;
  street: Street;
  heroPosition: Position;
  villainPosition?: Position;
  stackBucket: StackBucket;
  potType: PotType;
  players: PlayerCount;
  inPosition: boolean;
  theme: string;
  gameType?: GameType;
  boardTexture?: BoardTexture;
  actionOpportunity?: string;
};

export type SampleCoverage = {
  total: number;
  street: Record<string, number>;
  position: Record<string, number>;
  stack: Record<string, number>;
  potType: Record<string, number>;
  players: Record<string, number>;
  positionRelation: Record<string, number>;
  gameType: Record<string, number>;
  boardTexture: Record<string, number>;
  theme: Record<string, number>;
  actionOpportunity: Record<string, number>;
};

const increment = (record: Record<string, number>, key: string) => {
  record[key] = (record[key] ?? 0) + 1;
};

function shuffle<T>(items: T[], random: () => number = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function describeCoverage(spots: SpotDescriptor[]): SampleCoverage {
  const coverage: SampleCoverage = {
    total: spots.length,
    street: {}, position: {}, stack: {}, potType: {}, players: {},
    positionRelation: {}, gameType: {}, boardTexture: {}, theme: {}, actionOpportunity: {},
  };

  for (const spot of spots) {
    increment(coverage.street, spot.street);
    increment(coverage.position, spot.heroPosition);
    increment(coverage.stack, spot.stackBucket);
    increment(coverage.potType, spot.potType);
    increment(coverage.players, spot.players);
    increment(coverage.positionRelation, spot.inPosition ? "IP" : "OOP");
    increment(coverage.gameType, spot.gameType ?? "unspecified");
    increment(coverage.boardTexture, spot.boardTexture ?? "unspecified");
    increment(coverage.theme, spot.theme || "unspecified");
    increment(coverage.actionOpportunity, spot.actionOpportunity ?? "unspecified");
  }
  return coverage;
}

function scarcityScore(counts: SampleCoverage, spot: SpotDescriptor) {
  const dimensions = [
    counts.street[spot.street] ?? 0,
    counts.position[spot.heroPosition] ?? 0,
    counts.stack[spot.stackBucket] ?? 0,
    counts.potType[spot.potType] ?? 0,
    counts.players[spot.players] ?? 0,
    counts.positionRelation[spot.inPosition ? "IP" : "OOP"] ?? 0,
    counts.gameType[spot.gameType ?? "unspecified"] ?? 0,
    counts.boardTexture[spot.boardTexture ?? "unspecified"] ?? 0,
    counts.theme[spot.theme || "unspecified"] ?? 0,
    counts.actionOpportunity[spot.actionOpportunity ?? "unspecified"] ?? 0,
  ];
  return dimensions.reduce((score, count) => score + 1 / (count + 1), 0);
}

/**
 * Selects spots that look random to the player while actively preferring
 * underrepresented dimensions. This prevents a profile session from becoming
 * accidentally dominated by one street, position, stack depth or theme.
 */
export function balancedSpotSample(bank: SpotDescriptor[], requested: number, random: () => number = Math.random) {
  if (requested <= 0 || bank.length === 0) return [];
  const uniqueBank = Array.from(new Map(bank.map(spot => [spot.id, spot])).values());
  const target = Math.min(Math.floor(requested), uniqueBank.length);
  const remaining = shuffle(uniqueBank, random);
  const result: SpotDescriptor[] = [];

  while (result.length < target && remaining.length > 0) {
    const coverage = describeCoverage(result);
    let bestScore = -Infinity;
    let candidates: number[] = [];

    remaining.forEach((spot, index) => {
      const score = scarcityScore(coverage, spot);
      if (score > bestScore + 1e-9) {
        bestScore = score;
        candidates = [index];
      } else if (Math.abs(score - bestScore) <= 1e-9) {
        candidates.push(index);
      }
    });

    const chosenIndex = candidates[Math.floor(random() * candidates.length)] ?? 0;
    result.push(remaining.splice(chosenIndex, 1)[0]);
  }

  return result;
}

export function coverageRatio(coverage: Record<string, number>, expectedKeys: string[]) {
  if (expectedKeys.length === 0) return 1;
  const represented = expectedKeys.filter(key => (coverage[key] ?? 0) > 0).length;
  return represented / expectedKeys.length;
}
