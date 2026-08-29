export type ReconstructedHand = {
  gameType: "cash" | "tournament" | "unknown";
  heroPosition: string | null;
  heroHand: string | null;
  blinds: string | null;
  effectiveStackBB: number | null;
  board: string[];
  streets: { street: "preflop" | "flop" | "turn" | "river"; text: string }[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  missing: string[];
};

const POSITIONS = ["UTG+2","UTG+1","UTG","LJ","MP","HJ","CO","BTN","SB","BB"];

function parseCards(text: string) {
  const normalized = text.replace(/10/gi, "T");
  const matches = normalized.match(/(?:[2-9TJQKA][♠♥♦♣shdc])+/gi) ?? [];
  const cards: string[] = [];
  for (const chunk of matches) {
    const parts = chunk.match(/[2-9TJQKA][♠♥♦♣shdc]/gi) ?? [];
    cards.push(...parts.map(card => card.toUpperCase()
      .replace(/S$/, "♠").replace(/H$/, "♥").replace(/D$/, "♦").replace(/C$/, "♣")));
  }
  return cards;
}

function detectPosition(text: string) {
  const upper = text.toUpperCase();
  return POSITIONS.find(p => new RegExp(`\\b${p.replace("+", "\\+")}\\b`).test(upper)) ?? null;
}

function detectStackBB(text: string) {
  const match = text.match(/(?:stack(?: efetivo)?|effective stack|com)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*bb/i)
    ?? text.match(/(\d+(?:[.,]\d+)?)\s*bb\s*(?:effective|efetivo)?/i);
  return match ? Number(match[1].replace(",", ".")) : null;
}

function detectBlinds(text: string) {
  const match = text.match(/(?:blinds?\s*)?(\d+(?:[.,]\d+)?\s*[kKmM]?)\s*[\/x-]\s*(\d+(?:[.,]\d+)?\s*[kKmM]?)/i);
  return match ? `${match[1]}/${match[2]}` : null;
}

function section(text: string, name: string, nextNames: string[]) {
  const alternatives = nextNames.join("|");
  const regex = new RegExp(`${name}\\s*[:\\-]?\\s*([\\s\\S]*?)(?=${alternatives ? `(?:${alternatives})\\s*[:\\-]?` : "$"})`, "i");
  return regex.exec(text)?.[1]?.trim() ?? "";
}

export function reconstructHand(text: string): ReconstructedHand {
  const source = text.trim();
  const lower = source.toLowerCase();
  const gameType = /torneio|tournament|mtt|sit.?go/.test(lower) ? "tournament" : /cash/.test(lower) ? "cash" : "unknown";
  const heroPosition = detectPosition(source);
  const effectiveStackBB = detectStackBB(source);
  const blinds = detectBlinds(source);
  const cards = parseCards(source);
  const heroHand = cards.length >= 2 ? `${cards[0]} ${cards[1]}` : null;

  const flopText = section(source, "flop", ["turn", "river"]);
  const turnText = section(source, "turn", ["river"]);
  const riverText = section(source, "river", []);
  const boardCards = [
    ...parseCards(flopText).slice(0, 3),
    ...parseCards(turnText).slice(0, 1),
    ...parseCards(riverText).slice(0, 1),
  ];

  const preflopText = section(source, "pre[- ]?flop", ["flop", "turn", "river"]);
  const streets: ReconstructedHand["streets"] = [];
  if (preflopText) streets.push({street:"preflop", text:preflopText});
  if (flopText) streets.push({street:"flop", text:flopText});
  if (turnText) streets.push({street:"turn", text:turnText});
  if (riverText) streets.push({street:"river", text:riverText});

  const missing: string[] = [];
  if (!heroPosition) missing.push("posição do herói");
  if (!heroHand) missing.push("cartas do herói");
  if (!effectiveStackBB) missing.push("stack efetivo em BB");
  if (!blinds && gameType === "tournament") missing.push("blinds");
  if (streets.length === 0) missing.push("histórico por street");

  const resolved = 5 - Math.min(5, missing.length);
  const confidence = resolved >= 4 ? "HIGH" : resolved >= 2 ? "MEDIUM" : "LOW";
  return {gameType, heroPosition, heroHand, blinds, effectiveStackBB, board:boardCards, streets, confidence, missing};
}

export function reconstructionSummary(hand: ReconstructedHand) {
  const known = [
    hand.gameType !== "unknown" ? hand.gameType.toUpperCase() : null,
    hand.heroPosition,
    hand.heroHand,
    hand.effectiveStackBB ? `${hand.effectiveStackBB} BB` : null,
    hand.blinds ? `blinds ${hand.blinds}` : null,
  ].filter(Boolean);
  return known.join(" · ") || "Informações insuficientes para reconstrução automática.";
}
