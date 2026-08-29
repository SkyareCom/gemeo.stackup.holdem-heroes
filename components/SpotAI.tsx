"use client";

import { useEffect, useMemo, useState } from "react";
import type { TrainingSpot } from "../data/training-spots";
import { askConfiguredAI } from "../lib/ai-client";
import { buildAISpotContext } from "../lib/ai-spot-context";
import { canAskSpotQuestion, defaultAISettings, loadAISettings, type LocalAISettings } from "../lib/local-ai-settings";
import { getPlayerDNAFromMemory } from "../lib/player-memory";
import { classifyPlayerArchetype, diagnosticReadiness } from "../lib/profile-diagnostic";
import { stackBucketToBB } from "../data/training-spots";

export default function SpotAI({ spot, spotIndex }: { spot: TrainingSpot; spotIndex: number }) {
  const [settings, setSettings] = useState<LocalAISettings>(defaultAISettings);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(0);

  useEffect(() => setSettings(loadAISettings()), []);
  useEffect(() => {
    setQuestion("");
    setAnswer("");
    setError("");
    setAsked(0);
  }, [spot.id]);

  const configured = useMemo(() => Boolean(
    settings.apiKey.trim() &&
    settings.model.trim() &&
    (settings.provider !== "custom" || settings.baseUrl?.trim())
  ), [settings]);

  async function ask() {
    if (!configured || !question.trim() || loading || !canAskSpotQuestion(asked, settings)) return;
    setLoading(true);
    setError("");
    try {
      const stack = stackBucketToBB(spot.stackBucket, spotIndex);
      const dna = getPlayerDNAFromMemory();
      const readiness = diagnosticReadiness(dna);
      const archetype = classifyPlayerArchetype(dna);
      const context = buildAISpotContext({
        phase: "PROFILE",
        street: spot.street,
        heroPosition: spot.heroPosition,
        villainPosition: spot.villainPosition ?? "UNKNOWN",
        heroHand: spot.heroHand,
        board: spot.board.join(" "),
        pot: spot.potBB,
        heroStack: stack,
        villainStack: stack,
        actionHistory: [spot.label],
        currentBet: spot.facingBetBB ? { size: spot.facingBetBB } : undefined,
        userQuestion: question.trim(),
      });

      const text = await askConfiguredAI(settings, {
        system: [
          "Você é o analista de spots do Stackup Hold'em AI Solver.",
          "Use os cálculos determinísticos recebidos como fonte de verdade numérica.",
          "Não invente ranges, frequências ou equities que não estejam disponíveis.",
          "Explique a decisão de forma curta, prática e tecnicamente rigorosa.",
          `Player DNA: ${dna.sampleSize} decisões; prontidão ${readiness.label}; arquétipo ${archetype.archetype}; confiança ${(archetype.confidence * 100).toFixed(0)}%.`,
        ].join("\n"),
        prompt: JSON.stringify(context),
      });
      setAnswer(text);
      setAsked(value => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao consultar IA deste spot.");
    } finally {
      setLoading(false);
    }
  }

  const remaining = Math.max(0, Math.max(1, settings.maxQuestionsPerSpot) - asked);

  return <div className="concept-detail">
    <section>
      <b>PERGUNTAR À IA SOBRE ESTE SPOT</b>
      <p>{configured ? `${remaining} pergunta(s) restante(s) neste spot.` : "Configure provider, modelo e API key no módulo PERGUNTE À IA."}</p>
      <textarea value={question} onChange={event => setQuestion(event.target.value)} placeholder="Ex.: Por que esse spot favorece call em vez de raise?" />
      <button className="primary purple-btn" onClick={ask} disabled={!configured || !question.trim() || loading || remaining === 0}>
        {loading ? "ANALISANDO..." : remaining === 0 ? "LIMITE ATINGIDO" : "PERGUNTAR À IA"}
      </button>
      {error && <p>{error}</p>}
      {answer && <p>{answer}</p>}
    </section>
  </div>;
}
