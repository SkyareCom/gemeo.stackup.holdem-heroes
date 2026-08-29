import type { PokerDecision } from "./profile-engine";
import { buildPlayerDNA } from "./profile-engine";

const STORAGE_KEY = "stackup.player-memory.v1";
const MAX_DECISIONS = 5000;

export type AnalyzedHandRecord = {
  id: string;
  createdAt: string;
  summary: string;
  tags?: string[];
};

export type PlayerMemory = {
  version: 1;
  decisions: PokerDecision[];
  analyzedHands: AnalyzedHandRecord[];
  questionsAsked: number;
  updatedAt: string;
};

export const emptyPlayerMemory = (): PlayerMemory => ({
  version: 1,
  decisions: [],
  analyzedHands: [],
  questionsAsked: 0,
  updatedAt: new Date(0).toISOString(),
});

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadPlayerMemory(): PlayerMemory {
  if (!canUseStorage()) return emptyPlayerMemory();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyPlayerMemory();
    const parsed = JSON.parse(raw) as Partial<PlayerMemory>;
    return {
      version: 1,
      decisions: Array.isArray(parsed.decisions) ? parsed.decisions.slice(-MAX_DECISIONS) : [],
      analyzedHands: Array.isArray(parsed.analyzedHands) ? parsed.analyzedHands : [],
      questionsAsked: Number.isFinite(parsed.questionsAsked) ? Number(parsed.questionsAsked) : 0,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return emptyPlayerMemory();
  }
}

export function savePlayerMemory(memory: PlayerMemory) {
  const normalized: PlayerMemory = {
    ...memory,
    version: 1,
    decisions: memory.decisions.slice(-MAX_DECISIONS),
    updatedAt: new Date().toISOString(),
  };
  if (canUseStorage()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function recordDecision(decision: PokerDecision) {
  const memory = loadPlayerMemory();
  const normalized: PokerDecision = {
    ...decision,
    id: decision.id ?? `${decision.spotId ?? "spot"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: decision.timestamp ?? new Date().toISOString(),
  };
  return savePlayerMemory({ ...memory, decisions: [...memory.decisions, normalized] });
}

export function recordAnalyzedHand(record: Omit<AnalyzedHandRecord, "createdAt"> & { createdAt?: string }) {
  const memory = loadPlayerMemory();
  const hand: AnalyzedHandRecord = { ...record, createdAt: record.createdAt ?? new Date().toISOString() };
  return savePlayerMemory({ ...memory, analyzedHands: [hand, ...memory.analyzedHands].slice(0, 500) });
}

export function incrementQuestionsAsked() {
  const memory = loadPlayerMemory();
  return savePlayerMemory({ ...memory, questionsAsked: memory.questionsAsked + 1 });
}

export function getPlayerDNAFromMemory() {
  const memory = loadPlayerMemory();
  return buildPlayerDNA(memory.decisions);
}

export function clearPlayerMemory() {
  if (canUseStorage()) window.localStorage.removeItem(STORAGE_KEY);
  return emptyPlayerMemory();
}

export function exportPlayerMemory() {
  return JSON.stringify(loadPlayerMemory(), null, 2);
}

export function importPlayerMemory(serialized: string) {
  const parsed = JSON.parse(serialized) as PlayerMemory;
  if (parsed.version !== 1 || !Array.isArray(parsed.decisions)) throw new Error("Formato de memória incompatível.");
  return savePlayerMemory(parsed);
}
