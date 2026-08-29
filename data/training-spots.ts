import type { SpotDescriptor, Position, Street, PotType, StackBucket } from "../lib/spot-sampler";

export type TrainingSpot = SpotDescriptor & {
  heroHand: string;
  board: string[];
  potBB: number;
  facingBetBB?: number;
  legalActions: string[];
  label: string;
};

export const PROFILE_OPPORTUNITIES = [
  "vpip","pfr","3bet","4bet","squeeze","blind-defense","shove",
  "cbet","fold-to-cbet","check-raise","probe","delayed-cbet","double-barrel","triple-barrel",
  "overbet","thin-value","bluff-catch","value","bluff","icm-pressure"
] as const;

const positions: Position[] = ["UTG", "MP", "HJ", "CO", "BTN", "SB", "BB"];
const streets: Street[] = ["preflop", "flop", "turn", "river"];
const stacks: StackBucket[] = ["short", "medium", "deep"];
const pots: PotType[] = ["srp", "3bet", "4bet"];
const hands = ["A♦K♦", "Q♠Q♥", "J♣T♣", "9♠8♠", "A♥5♥", "K♣Q♦", "7♦6♦", "A♣Q♣", "T♥T♣", "K♠J♠", "5♣5♦", "Q♥J♥", "A♠J♦", "8♣8♦"];
const boards: Record<Street, string[][]> = {
  preflop: [[]],
  flop: [["A♠","7♥","2♣"],["J♠","T♠","4♦"],["8♥","8♣","3♦"],["K♣","9♣","6♣"],["Q♦","6♠","2♥"],["9♥","7♦","5♣"]],
  turn: [["A♠","7♥","2♣","T♦"],["J♠","T♠","4♦","2♥"],["8♥","8♣","3♦","K♠"],["K♣","9♣","6♣","2♣"],["Q♦","6♠","2♥","J♣"]],
  river: [["A♠","7♥","2♣","T♦","4♠"],["J♠","T♠","4♦","2♥","A♣"],["8♥","8♣","3♦","K♠","6♥"],["K♣","9♣","6♣","2♣","J♦"],["Q♦","6♠","2♥","J♣","3♠"]],
};

const PREFLOP_OPPORTUNITIES = ["vpip","pfr","3bet","4bet","squeeze","blind-defense","shove","icm-pressure"];
const FLOP_OPPORTUNITIES = ["cbet","fold-to-cbet","check-raise","bluff-catch","value","bluff","overbet","shove"];
const TURN_OPPORTUNITIES = ["probe","delayed-cbet","double-barrel","check-raise","bluff-catch","value","bluff","overbet","shove"];
const RIVER_OPPORTUNITIES = ["triple-barrel","thin-value","bluff-catch","value","bluff","overbet","check-raise","shove","icm-pressure"];

const opportunitiesForStreet = (street: Street) => street === "preflop"
  ? PREFLOP_OPPORTUNITIES
  : street === "flop"
    ? FLOP_OPPORTUNITIES
    : street === "turn"
      ? TURN_OPPORTUNITIES
      : RIVER_OPPORTUNITIES;

const texture = (board: string[]): TrainingSpot["boardTexture"] => {
  if (board.length === 0) return "none";
  const ranks = board.map(c => c[0]);
  const suits = board.map(c => c.slice(-1));
  if (new Set(ranks).size < ranks.length) return "paired";
  if (new Set(suits).size === 1) return "monotone";
  return board.some(c => ["T","J","Q","K"].includes(c[0])) ? "connected" : "dry";
};

function stackBB(bucket: StackBucket, variant = 0) {
  const base = bucket === "short" ? 20 : bucket === "medium" ? 40 : 100;
  const offsets = bucket === "short" ? [-8,-5,-2,0,3,5,8,10] : bucket === "medium" ? [-10,-7,-4,0,5,10,15,20] : [-25,-15,-10,0,15,25,40,60];
  return Math.max(8, base + offsets[variant % offsets.length]);
}

function legalActions(street: Street, opportunity: string, facingBet: boolean) {
  if (street === "preflop") return ["FOLD","CALL","RAISE","ALL-IN"];
  if (["fold-to-cbet","bluff-catch"].includes(opportunity) || facingBet) return ["FOLD","CALL","RAISE","ALL-IN"];
  if (opportunity === "check-raise") return ["CHECK","RAISE","ALL-IN"];
  return ["CHECK","BET 33%","BET 75%","ALL-IN"];
}

export function generateTrainingSpotBank(): TrainingSpot[] {
  const bank: TrainingSpot[] = [];
  let id = 1;
  for (let variant = 0; variant < 18; variant++) {
    for (const street of streets) {
      for (const stackBucket of stacks) {
        for (const potType of pots) {
          for (let p = 0; p < positions.length; p++) {
            const heroPosition = positions[p];
            const villainPosition = positions[(p + 2 + variant) % positions.length];
            if (heroPosition === villainPosition) continue;
            const inPosition = ["CO","BTN"].includes(heroPosition) || villainPosition === "BB";
            const boardVariants = boards[street];
            const board = boardVariants[(id + variant) % boardVariants.length];
            const potBase = potType === "srp" ? 6.5 : potType === "3bet" ? 18 : 42;
            const potBB = Math.round((potBase * (0.85 + (variant % 6) * 0.06)) * 10) / 10;
            const opportunityPool = opportunitiesForStreet(street);
            let opportunity = opportunityPool[(variant + p + pots.indexOf(potType) + stacks.indexOf(stackBucket)) % opportunityPool.length];
            const gameType = variant % 3 === 0 ? "cash" : "tournament";
            if (opportunity === "icm-pressure" && gameType !== "tournament") opportunity = street === "river" ? "thin-value" : street === "preflop" ? "shove" : "value";
            if (opportunity === "blind-defense" && !["SB","BB"].includes(heroPosition)) opportunity = variant % 2 ? "vpip" : "pfr";
            const naturallyFacing = ["fold-to-cbet","bluff-catch","check-raise"].includes(opportunity);
            const isFacingBet = street !== "preflop" && (naturallyFacing || variant % 3 !== 0);
            const betFraction = opportunity === "overbet" ? 1.25 : variant % 4 === 0 ? .25 : variant % 4 === 1 ? .33 : variant % 4 === 2 ? .66 : 1;
            const facingBetBB = isFacingBet ? Math.round(potBB * betFraction * 10) / 10 : undefined;
            const bb = stackBB(stackBucket, variant);
            bank.push({
              id: `spot-${String(id++).padStart(5,"0")}`,
              street,
              heroPosition,
              villainPosition,
              stackBucket,
              potType,
              players: variant % 7 === 0 ? "multiway" : "heads-up",
              inPosition,
              theme: `${street}-${potType}-${inPosition ? "ip" : "oop"}-${opportunity}`,
              gameType,
              boardTexture: texture(board),
              actionOpportunity: opportunity,
              heroHand: hands[(id + variant) % hands.length],
              board,
              potBB,
              facingBetBB,
              legalActions: legalActions(street, opportunity, Boolean(facingBetBB)),
              label: `${heroPosition} vs ${villainPosition} · ${bb} BB · ${potType.toUpperCase()} · ${street.toUpperCase()} · ${opportunity.toUpperCase()}`,
            });
          }
        }
      }
    }
  }
  return bank;
}

export function stackBucketToBB(bucket: StackBucket, variant = 0) {
  return stackBB(bucket, variant);
}
