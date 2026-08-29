import type { SpotDescriptor, Position, Street, PotType, StackBucket } from "../lib/spot-sampler";

export type TrainingSpot = SpotDescriptor & {
  heroHand: string;
  board: string[];
  potBB: number;
  facingBetBB?: number;
  legalActions: string[];
  label: string;
};

const positions: Position[] = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];
const streets: Street[] = ["preflop", "flop", "turn", "river"];
const stacks: StackBucket[] = ["short", "medium", "deep"];
const pots: PotType[] = ["srp", "3bet", "4bet"];
const hands = ["A♦K♦", "Q♠Q♥", "J♣T♣", "9♠8♠", "A♥5♥", "K♣Q♦"];
const boards: Record<Street, string[][]> = {
  preflop: [[]],
  flop: [["A♠","7♥","2♣"],["J♠","T♠","4♦"],["8♥","8♣","3♦"],["K♣","9♣","6♣"]],
  turn: [["A♠","7♥","2♣","T♦"],["J♠","T♠","4♦","2♥"],["8♥","8♣","3♦","K♠"]],
  river: [["A♠","7♥","2♣","T♦","4♠"],["J♠","T♠","4♦","2♥","A♣"],["8♥","8♣","3♦","K♠","6♥"]],
};

const texture = (board: string[]): TrainingSpot["boardTexture"] => {
  if (board.length === 0) return "none";
  const ranks = board.map(c => c[0]);
  const suits = board.map(c => c.slice(-1));
  if (new Set(ranks).size < ranks.length) return "paired";
  if (new Set(suits).size === 1) return "monotone";
  return board.some(c => ["T","J","Q","K"].includes(c[0])) ? "connected" : "dry";
};

function stackBB(bucket: StackBucket) {
  return bucket === "short" ? 20 : bucket === "medium" ? 40 : 100;
}

export function generateTrainingSpotBank(): TrainingSpot[] {
  const bank: TrainingSpot[] = [];
  let id = 1;
  for (const street of streets) {
    for (const stackBucket of stacks) {
      for (const potType of pots) {
        for (let p = 0; p < positions.length; p++) {
          const heroPosition = positions[p];
          const villainPosition = positions[(p + 2) % positions.length];
          const inPosition = ["CO","BTN"].includes(heroPosition) || villainPosition === "BB";
          const boardVariants = boards[street];
          const board = boardVariants[(id - 1) % boardVariants.length];
          const potBB = potType === "srp" ? 6.5 : potType === "3bet" ? 18 : 42;
          const facingBetBB = street === "preflop" ? undefined : Math.round(potBB * (["turn","river"].includes(street) ? .66 : .33) * 10) / 10;
          const opportunity = street === "preflop"
            ? (heroPosition === "BB" ? "blind-defense" : potType === "3bet" ? "3bet" : "vpip")
            : facingBetBB ? "bluff-catch" : "value";
          bank.push({
            id: `spot-${String(id++).padStart(4,"0")}`,
            street,
            heroPosition,
            villainPosition,
            stackBucket,
            potType,
            players: "heads-up",
            inPosition,
            theme: `${street}-${potType}-${inPosition ? "ip" : "oop"}`,
            gameType: id % 3 === 0 ? "cash" : "tournament",
            boardTexture: texture(board),
            actionOpportunity: opportunity,
            heroHand: hands[(id - 1) % hands.length],
            board,
            potBB,
            facingBetBB,
            legalActions: street === "preflop" ? ["FOLD","CALL","RAISE","ALL-IN"] : facingBetBB ? ["FOLD","CALL","RAISE","ALL-IN"] : ["CHECK","BET 33%","BET 75%","ALL-IN"],
            label: `${heroPosition} vs ${villainPosition} · ${stackBB(stackBucket)} BB · ${potType.toUpperCase()} · ${street.toUpperCase()}`,
          });
        }
      }
    }
  }
  return bank;
}

export function stackBucketToBB(bucket: StackBucket) {
  return stackBB(bucket);
}
