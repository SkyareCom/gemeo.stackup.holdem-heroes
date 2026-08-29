"use client";

import { useEffect, useState } from "react";
import SharedPokerTable from "./SharedPokerTable";
import { askConfiguredAI } from "../lib/ai-client";
import { loadAISettings, type LocalAISettings } from "../lib/local-ai-settings";
import { getPlayerDNAFromMemory, recordAnalyzedHand } from "../lib/player-memory";
import { classifyPlayerArchetype, diagnosticReadiness } from "../lib/profile-diagnostic";
import { reconstructHand, reconstructionSummary, type ReconstructedHand } from "../lib/hand-reconstruction";

export default function HandAnalysisWorkspace({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<LocalAISettings | null>(null);
  const [handText, setHandText] = useState("");
  const [reconstruction, setReconstruction] = useState<ReconstructedHand | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setSettings(loadAISettings()), []);

  function reconstruct() {
    setAnalysis("");
    setError("");
    setReconstruction(reconstructHand(handText));
  }

  async function analyze() {
    const hand = reconstruction ?? reconstructHand(handText);
    setReconstruction(hand);
    if (!settings?.apiKey.trim() || !settings.model.trim()) {
      setError("Configure provider, modelo e API key em PERGUNTE À IA antes da análise.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const dna = getPlayerDNAFromMemory();
      const readiness = diagnosticReadiness(dna);
      const archetype = classifyPlayerArchetype(dna);
      const dnaContext = dna.sampleSize > 0
        ? `Player DNA: ${dna.sampleSize} decisões; ${readiness.label}; arquétipo ${archetype.archetype}; confiança ${(archetype.confidence * 100).toFixed(0)}%. Não trate métricas insuficientes como fatos.`
        : "Player DNA sem amostra suficiente.";
      const facts = JSON.stringify({
        gameType: hand.gameType,
        heroPosition: hand.heroPosition,
        heroHand: hand.heroHand,
        blinds: hand.blinds,
        effectiveStackBB: hand.effectiveStackBB,
        board: hand.board,
        streets: hand.streets,
        confidence: hand.confidence,
        missing: hand.missing,
      });
      const response = await askConfiguredAI(settings, {
        system: [
          "Você é o módulo de análise de mãos do Stackup Hold'em AI Solver.",
          "Use somente fatos presentes na mão reconstruída ou explicitamente narrados pelo jogador.",
          "Nunca invente pot odds, equity, ranges exatos, ICM ou sizing quando faltarem dados determinísticos.",
          "Quando algum cálculo depender de informação ausente, marque DADOS INSUFICIENTES e diga qual dado falta.",
          "Analise preflop, flop, turn e river apenas quando essas streets existirem.",
          "Considere ranges, posição, stack, SPR, pot odds, implied/reverse implied odds, blockers, equity, value/bluff, sizing, range/nut advantage, GTO, exploit e ICM quando houver dados para isso.",
          "Estruture obrigatoriamente em: O QUE ACONTECEU; ANÁLISE; MELHOR LINHA; ALTERNATIVAS; PONTO PRINCIPAL DA MÃO.",
          dnaContext,
        ].join("\n"),
        prompt: `MÃO ORIGINAL:\n${handText.trim()}\n\nRECONSTRUÇÃO DETERMINÍSTICA:\n${facts}`,
      });
      setAnalysis(response);
      recordAnalyzedHand({
        id: `hand-${Date.now()}`,
        summary: reconstructionSummary(hand),
        tags: [hand.gameType, hand.confidence, ...(hand.heroPosition ? [hand.heroPosition] : [])],
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao analisar a mão.");
    } finally {
      setLoading(false);
    }
  }

  return <section className="workspace">
    <button className="back" onClick={onBack}>← HOME</button>
    <div className="eyebrow purple">AI HAND REVIEW</div>
    <h2>CONTE UMA MÃO.</h2>
    <p className="lead">O sistema reconstrói primeiro os fatos. A IA só analisa depois, mantendo ausências explícitas.</p>
    <div className="hand-layout">
      <div>
        <textarea value={handText} onChange={e => { setHandText(e.target.value); setReconstruction(null); setAnalysis(""); }} placeholder="Ex.: Torneio, blinds 1k/2k. BTN com A♦K♦, 40bb efetivos. Pré-flop... Flop A♠ 7♥ 2♣..." />
        <div className="actions">
          <button onClick={reconstruct} disabled={!handText.trim()}>RECONSTRUIR</button>
          <button className="primary purple-btn" onClick={analyze} disabled={!handText.trim() || loading}>{loading ? "ANALISANDO..." : "ANALISAR COM IA"}</button>
        </div>
      </div>
      <SharedPokerTable hero={reconstruction?.heroPosition ? `HERO · ${reconstruction.heroPosition} · ${reconstruction.heroHand ?? "?"}` : undefined} board={reconstruction?.board.length ? reconstruction.board : undefined} />
    </div>

    {reconstruction && <div className="analysis-preview">
      <Result title={`RECONSTRUÇÃO · ${reconstruction.confidence}`} text={reconstructionSummary(reconstruction)} />
      <Result title="BOARD IDENTIFICADO" text={reconstruction.board.length ? reconstruction.board.join(" ") : "Não identificado explicitamente."} />
      <Result title="STREETS IDENTIFICADAS" text={reconstruction.streets.length ? reconstruction.streets.map(s => s.street.toUpperCase()).join(" → ") : "Nenhuma street delimitada."} />
      <Result title="DADOS AUSENTES" text={reconstruction.missing.length ? reconstruction.missing.join(" · ") : "Nenhum campo crítico ausente."} />
    </div>}
    {error && <div className="truth-note"><b>ANÁLISE BLOQUEADA</b><span>{error}</span></div>}
    {analysis && <div className="concept-detail"><section><b>ANÁLISE DA IA</b><p>{analysis}</p></section></div>}
  </section>;
}

function Result({ title, text }: { title: string; text: string }) {
  return <div className="result"><b>{title}</b><p>{text}</p></div>;
}
