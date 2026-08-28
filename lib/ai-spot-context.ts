import { calculateSpotMath } from "./spot-math-context";

export type AISpotContextInput = {
  phase: string;
  street: string;
  heroPosition: string;
  villainPosition: string;
  heroHand: string;
  board: string;
  pot: number;
  heroStack: number;
  villainStack: number;
  actionHistory: string[];
  currentBet?: { size: number; potPercent?: number };
  solverVerdict?: string;
  solverExplanation?: string;
  userQuestion: string;
  outs?: number;
};

export function buildAISpotContext(input: AISpotContextInput) {
  const math = calculateSpotMath({
    potBeforeBet: input.pot,
    betToHero: input.currentBet?.size ?? 0,
    effectiveStack: Math.min(input.heroStack, input.villainStack),
    outs: input.outs,
    cardsToCome: input.street.toUpperCase() === "FLOP" ? 2 : 1,
  });

  return {
    fase: input.phase,
    street: input.street,
    posicao_heroi: input.heroPosition,
    posicao_vilao: input.villainPosition,
    mao_heroi: input.heroHand,
    board: input.board,
    pot: input.pot,
    stack_heroi: input.heroStack,
    stack_vilao: input.villainStack,
    acao_historico: input.actionHistory,
    aposta_atual: input.currentBet ? { tamanho: input.currentBet.size, percentual_pote: input.currentBet.potPercent ?? null } : null,
    veredito_solver: input.solverVerdict ?? null,
    explicacao_solver: input.solverExplanation ?? null,
    calculos: {
      spr: math.spr,
      pot_odds: math.potOddsRatio,
      equity_necessaria: math.requiredEquity,
      equity_outs_aproximada: math.outsEquity,
    },
    pergunta_usuario: input.userQuestion,
  };
}
