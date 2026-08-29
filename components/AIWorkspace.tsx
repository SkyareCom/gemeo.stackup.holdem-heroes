"use client";

import { useEffect, useState } from "react";
import { askConfiguredAI } from "../lib/ai-client";
import { defaultAISettings, loadAISettings, saveAISettings, type LocalAISettings } from "../lib/local-ai-settings";
import { getPlayerDNAFromMemory } from "../lib/player-memory";
import { classifyPlayerArchetype, diagnosticReadiness } from "../lib/profile-diagnostic";

export default function AIWorkspace({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<LocalAISettings>(defaultAISettings);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setSettings(loadAISettings()), []);

  function patchSettings(patch: Partial<LocalAISettings>) {
    setSettings(current => {
      const next = { ...current, ...patch };
      saveAISettings(next);
      return next;
    });
  }

  async function ask() {
    if (!question.trim() || loading) return;
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      const dna = getPlayerDNAFromMemory();
      const readiness = diagnosticReadiness(dna);
      const classification = classifyPlayerArchetype(dna);
      const playerContext = dna.sampleSize > 0
        ? `Player DNA: ${dna.sampleSize} decisões; prontidão ${readiness.label}; arquétipo ${classification.archetype}; confiança ${(classification.confidence * 100).toFixed(0)}%. Não trate métricas insuficientes como fatos.`
        : "Player DNA ainda sem amostra útil.";

      const text = await askConfiguredAI(settings, {
        system: [
          "Você é o assistente de poker do Stackup Hold'em AI Solver.",
          "Responda em português claro e tecnicamente rigoroso.",
          "Diferencie regra universal, torneio, cash, regulamento específico e decisão de floor quando aplicável.",
          "Nunca invente números, frequências ou regras específicas ausentes.",
          "Quando a resposta depender de regulamento local, declare a dependência.",
          playerContext,
        ].join("\n"),
        prompt: question.trim(),
      });
      setAnswer(text);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao consultar IA.");
    } finally {
      setLoading(false);
    }
  }

  const configured = Boolean(settings.apiKey.trim() && settings.model.trim() && (settings.provider !== "custom" || settings.baseUrl?.trim()));

  return <section className="workspace">
    <button className="back" onClick={onBack}>← HOME</button>
    <div className="eyebrow purple">POKER ASSISTANT</div>
    <h2>PERGUNTE À IA.</h2>
    <p className="lead">Estratégia, regras, situações e dúvidas conectadas ao contexto disponível do jogador.</p>

    <div className="quick-fields">
      <select value={settings.provider} onChange={e => patchSettings({ provider: e.target.value as LocalAISettings["provider"] })}>
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
        <option value="custom">Custom</option>
      </select>
      <input value={settings.model} onChange={e => patchSettings({ model: e.target.value })} placeholder="MODELO" autoComplete="off" />
      <input type="password" value={settings.apiKey} onChange={e => patchSettings({ apiKey: e.target.value })} placeholder="API KEY" autoComplete="off" />
    </div>
    {settings.provider === "custom" && <input value={settings.baseUrl ?? ""} onChange={e => patchSettings({ baseUrl: e.target.value })} placeholder="https://seu-endpoint/v1/chat" />}

    <div className="ask-box">
      <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ex.: Dois jogadores foram eliminados na mesma mão. Quem fica melhor colocado?" />
      <button className="primary purple-btn" onClick={ask} disabled={!configured || !question.trim() || loading}>{loading ? "ANALISANDO..." : "PERGUNTAR"}</button>
    </div>

    {!configured && <div className="rule-note"><b>CONFIGURAÇÃO NECESSÁRIA</b><span>Defina provider, modelo e API key. A chave fica salva apenas no armazenamento local do navegador e é enviada à rota somente durante a consulta.</span></div>}
    {error && <div className="truth-note"><b>ERRO DA IA</b><span>{error}</span></div>}
    {answer && <div className="concept-detail"><section><b>RESPOSTA</b><p>{answer}</p></section></div>}
    <div className="rule-note"><b>CONTEXTO DE REGRAS</b><span>O sistema distingue regra universal, torneio, cash, regulamento específico e decisões de floor.</span></div>
  </section>;
}
