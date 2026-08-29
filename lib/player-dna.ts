import type { PlayerAction, PlayerDnaSpot } from "@/data/player-dna-spots";

export type PlayerDnaAnswer = { spotId: string; action: PlayerAction };

export type PlayerDnaResult = {
  label: string;
  confidence: number;
  scores: { aggression: number; discipline: number; pressure: number; passivity: number };
  strengths: string[];
  watchouts: string[];
};

export function evaluatePlayerDna(spots: PlayerDnaSpot[], answers: PlayerDnaAnswer[]): PlayerDnaResult {
  const totals = { aggression: 0, discipline: 0, pressure: 0, passivity: 0 };
  let maxTotal = 0;

  for (const answer of answers) {
    const spot = spots.find((item) => item.id === answer.spotId);
    if (!spot) continue;
    const selected = spot.weights[answer.action];
    if (!selected) continue;
    totals.aggression += selected.aggression;
    totals.discipline += selected.discipline;
    totals.pressure += selected.pressure;
    totals.passivity += selected.passivity;
    maxTotal += 3;
  }

  const normalize = (value: number) => maxTotal ? Math.round((value / maxTotal) * 100) : 0;
  const scores = {
    aggression: normalize(totals.aggression),
    discipline: normalize(totals.discipline),
    pressure: normalize(totals.pressure),
    passivity: normalize(totals.passivity),
  };

  let label = "EQUILIBRADO";
  if (scores.aggression >= 58 && scores.pressure >= 48) label = "AGRESSOR DE PRESSÃO";
  else if (scores.discipline >= 58 && scores.passivity < 48) label = "SELETIVO DISCIPLINADO";
  else if (scores.passivity >= 55) label = "CONTROLADOR PASSIVO";
  else if (scores.aggression >= 50) label = "AGRESSOR SELETIVO";

  const strengths: string[] = [];
  const watchouts: string[] = [];
  if (scores.discipline >= 45) strengths.push("Boa capacidade de abandonar linhas marginais.");
  if (scores.aggression >= 45) strengths.push("Disposição para disputar iniciativa e construir potes.");
  if (scores.pressure >= 45) strengths.push("Conforto em decisões de maior variância e pressão.");
  if (scores.passivity >= 50) watchouts.push("Tendência a ceder iniciativa em spots onde pressão pode capturar EV.");
  if (scores.aggression >= 65 && scores.discipline < 35) watchouts.push("Agressão pode estar avançando além da seletividade necessária.");
  if (scores.pressure >= 65 && scores.discipline < 40) watchouts.push("Risco de defender ou escalar potes demais sob pressão.");
  if (!strengths.length) strengths.push("Perfil ainda em formação; aumente a amostra para estabilizar o diagnóstico.");
  if (!watchouts.length) watchouts.push("Nenhum desvio dominante apareceu nesta amostra inicial.");

  const sampleConfidence = Math.min(92, 35 + answers.length * 4.5);
  return { label, confidence: Math.round(sampleConfidence), scores, strengths, watchouts };
}
