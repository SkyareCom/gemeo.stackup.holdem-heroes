export type SpotDescriptor = {
  id: string;
  street: "preflop" | "flop" | "turn" | "river";
  heroPosition: "UTG" | "MP" | "HJ" | "CO" | "BTN" | "SB" | "BB";
  stackBucket: "short" | "medium" | "deep";
  potType: "limped" | "srp" | "3bet" | "4bet";
  players: "heads-up" | "multiway";
  inPosition: boolean;
  theme: string;
};

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function balancedSpotSample(bank: SpotDescriptor[], requested: number) {
  if (requested <= 0 || bank.length === 0) return [];
  const streets: SpotDescriptor["street"][] = ["preflop","flop","turn","river"];
  const buckets = streets.map(street => shuffle(bank.filter(s => s.street === street)));
  const result: SpotDescriptor[] = [];
  let cursor = 0;

  while (result.length < Math.min(requested, bank.length)) {
    const bucket = buckets[cursor % buckets.length];
    const candidate = bucket.shift();
    if (candidate && !result.some(s => s.id === candidate.id)) result.push(candidate);
    cursor++;
    if (buckets.every(b => b.length === 0)) break;
  }

  return shuffle(result);
}
