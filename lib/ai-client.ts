import type { LocalAISettings } from "./local-ai-settings";

export type AIQuery = {
  system?: string;
  prompt: string;
};

export async function askConfiguredAI(settings: LocalAISettings, query: AIQuery) {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: settings.provider,
      apiKey: settings.apiKey,
      model: settings.model,
      baseUrl: settings.baseUrl,
      system: query.system,
      prompt: query.prompt,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error ?? "Falha ao consultar IA.");
  if (typeof payload?.text !== "string" || !payload.text.trim()) throw new Error("A IA respondeu sem conteúdo utilizável.");
  return payload.text.trim();
}
