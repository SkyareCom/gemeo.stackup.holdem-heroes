export type LocalAISettings = {
  provider: "openai" | "anthropic" | "custom";
  apiKey: string;
  model: string;
  baseUrl?: string;
  maxQuestionsPerSpot: number;
};

const STORAGE_KEY = "stackup-solver-ai-settings";

export const defaultAISettings: LocalAISettings = {
  provider: "openai",
  apiKey: "",
  model: "",
  baseUrl: "",
  maxQuestionsPerSpot: 3,
};

export function loadAISettings(): LocalAISettings {
  if (typeof window === "undefined") return defaultAISettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultAISettings, ...JSON.parse(raw) } : defaultAISettings;
  } catch {
    return defaultAISettings;
  }
}

export function saveAISettings(settings: LocalAISettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function canAskSpotQuestion(questionsAsked: number, settings: LocalAISettings) {
  return questionsAsked < Math.max(1, settings.maxQuestionsPerSpot);
}
