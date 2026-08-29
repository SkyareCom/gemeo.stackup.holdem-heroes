import { NextRequest, NextResponse } from "next/server";

type Provider = "openai" | "anthropic" | "custom";

type AIRequest = {
  provider: Provider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  system?: string;
  prompt: string;
};

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function extractOpenAIText(payload: any) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  const chunks = Array.isArray(payload?.output) ? payload.output : [];
  return chunks.flatMap((item: any) => Array.isArray(item?.content) ? item.content : [])
    .map((part: any) => part?.text)
    .filter((text: unknown) => typeof text === "string")
    .join("\n")
    .trim();
}

function extractAnthropicText(payload: any) {
  return (Array.isArray(payload?.content) ? payload.content : [])
    .map((part: any) => part?.text)
    .filter((text: unknown) => typeof text === "string")
    .join("\n")
    .trim();
}

export async function POST(request: NextRequest) {
  let body: AIRequest;
  try {
    body = await request.json();
  } catch {
    return badRequest("JSON inválido.");
  }

  const provider = body.provider;
  const apiKey = body.apiKey?.trim();
  const model = body.model?.trim();
  const prompt = body.prompt?.trim();

  if (!provider || !["openai", "anthropic", "custom"].includes(provider)) return badRequest("Provider inválido.");
  if (!apiKey) return badRequest("API key ausente.");
  if (!model) return badRequest("Modelo ausente.");
  if (!prompt) return badRequest("Pergunta vazia.");

  try {
    let response: Response;
    if (provider === "openai") {
      response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          input: [
            ...(body.system ? [{ role: "system", content: body.system }] : []),
            { role: "user", content: prompt },
          ],
          max_output_tokens: 1400,
        }),
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) return badRequest(payload?.error?.message ?? "Falha no provider OpenAI.", response.status);
      return NextResponse.json({ text: extractOpenAIText(payload) }, { headers: { "Cache-Control": "no-store" } });
    }

    if (provider === "anthropic") {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1400,
          ...(body.system ? { system: body.system } : {}),
          messages: [{ role: "user", content: prompt }],
        }),
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) return badRequest(payload?.error?.message ?? "Falha no provider Anthropic.", response.status);
      return NextResponse.json({ text: extractAnthropicText(payload) }, { headers: { "Cache-Control": "no-store" } });
    }

    const baseUrl = body.baseUrl?.trim();
    if (!baseUrl || !/^https?:\/\//i.test(baseUrl)) return badRequest("Base URL custom inválida.");
    response = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, system: body.system ?? "", prompt }),
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok) return badRequest(payload?.error?.message ?? "Falha no provider custom.", response.status);
    const text = payload?.text ?? payload?.output ?? payload?.response ?? payload?.message?.content;
    if (typeof text !== "string") return badRequest("Provider custom respondeu sem texto utilizável.", 502);
    return NextResponse.json({ text: text.trim() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Falha inesperada ao consultar IA.", 502);
  }
}
