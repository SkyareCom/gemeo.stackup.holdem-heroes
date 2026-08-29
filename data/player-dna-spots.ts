export type PlayerAction = "FOLD" | "CALL" | "RAISE";

export type PlayerDnaSpot = {
  id: string;
  street: "PREFLOP" | "FLOP" | "TURN" | "RIVER";
  villains: { position: string; stack: number; action: string; value: string }[];
  pot: { main: number; side?: number };
  hero: { position: string; cards: string; stack: number };
  board?: string;
  prompt: string;
  weights: Record<PlayerAction, { aggression: number; discipline: number; pressure: number; passivity: number }>;
};

export const playerDnaSpots: PlayerDnaSpot[] = [
  {
    id: "btn-vs-bb-3bet",
    street: "PREFLOP",
    villains: [{ position: "BB", stack: 96, action: "3-BET", value: "10 BB" }],
    pot: { main: 14.5 },
    hero: { position: "BTN", cards: "A♠ Q♠", stack: 97 },
    prompt: "BTN abre 2.5 BB e recebe 3-bet do BB. Qual é sua decisão padrão?",
    weights: {
      FOLD: { aggression: 0, discipline: 2, pressure: 0, passivity: 1 },
      CALL: { aggression: 0, discipline: 1, pressure: 1, passivity: 1 },
      RAISE: { aggression: 3, discipline: 0, pressure: 2, passivity: 0 },
    },
  },
  {
    id: "co-vs-btn-squeeze",
    street: "PREFLOP",
    villains: [
      { position: "BTN", stack: 82, action: "CALL", value: "2.5 BB" },
      { position: "SB", stack: 104, action: "SQUEEZE", value: "13 BB" },
    ],
    pot: { main: 19 },
    hero: { position: "CO", cards: "J♣ J♦", stack: 100 },
    prompt: "Você abriu CO, BTN pagou e SB aplicou squeeze. Como continua?",
    weights: {
      FOLD: { aggression: 0, discipline: 2, pressure: 0, passivity: 2 },
      CALL: { aggression: 0, discipline: 2, pressure: 1, passivity: 1 },
      RAISE: { aggression: 3, discipline: 0, pressure: 3, passivity: 0 },
    },
  },
  {
    id: "bb-flop-checkraise",
    street: "FLOP",
    villains: [{ position: "BTN", stack: 74, action: "BET", value: "5 BB" }],
    pot: { main: 12 },
    hero: { position: "BB", cards: "9♥ 8♥", stack: 78 },
    board: "T♥ 7♣ 2♥",
    prompt: "Você defendeu BB e enfrenta c-bet pequena com combo draw. Sua linha?",
    weights: {
      FOLD: { aggression: 0, discipline: 0, pressure: 0, passivity: 3 },
      CALL: { aggression: 0, discipline: 1, pressure: 1, passivity: 2 },
      RAISE: { aggression: 3, discipline: 1, pressure: 3, passivity: 0 },
    },
  },
  {
    id: "btn-turn-overcard",
    street: "TURN",
    villains: [{ position: "BB", stack: 63, action: "CHECK", value: "—" }],
    pot: { main: 26 },
    hero: { position: "BTN", cards: "K♠ Q♣", stack: 70 },
    board: "Q♦ 8♠ 4♣ A♥",
    prompt: "Após apostar flop e receber call, o turn traz A♥ e o BB dá check. Sua decisão?",
    weights: {
      FOLD: { aggression: 0, discipline: 0, pressure: 0, passivity: 3 },
      CALL: { aggression: 0, discipline: 1, pressure: 0, passivity: 2 },
      RAISE: { aggression: 2, discipline: 0, pressure: 2, passivity: 0 },
    },
  },
  {
    id: "river-bluffcatch",
    street: "RIVER",
    villains: [{ position: "CO", stack: 39, action: "BET", value: "28 BB" }],
    pot: { main: 42 },
    hero: { position: "BTN", cards: "A♣ J♣", stack: 61 },
    board: "A♦ T♠ 6♥ 3♣ 2♠",
    prompt: "Vilão dispara river grande em runout seco. Você tem top pair com kicker J.",
    weights: {
      FOLD: { aggression: 0, discipline: 3, pressure: 0, passivity: 1 },
      CALL: { aggression: 0, discipline: 1, pressure: 2, passivity: 1 },
      RAISE: { aggression: 3, discipline: 0, pressure: 3, passivity: 0 },
    },
  },
  {
    id: "multiway-flop",
    street: "FLOP",
    villains: [
      { position: "HJ", stack: 88, action: "BET", value: "7 BB" },
      { position: "BTN", stack: 52, action: "CALL", value: "7 BB" },
    ],
    pot: { main: 24, side: 0 },
    hero: { position: "BB", cards: "A♥ T♥", stack: 92 },
    board: "T♣ 9♣ 5♦",
    prompt: "Pote multiway: bet e call antes de você com top pair. Como reage?",
    weights: {
      FOLD: { aggression: 0, discipline: 2, pressure: 0, passivity: 2 },
      CALL: { aggression: 0, discipline: 2, pressure: 1, passivity: 1 },
      RAISE: { aggression: 3, discipline: 0, pressure: 3, passivity: 0 },
    },
  },
  {
    id: "sb-vs-btn-steal",
    street: "PREFLOP",
    villains: [{ position: "BTN", stack: 110, action: "OPEN", value: "2.2 BB" }],
    pot: { main: 3.7 },
    hero: { position: "SB", cards: "A♦ 5♦", stack: 100 },
    prompt: "BTN abre pequeno em posição de steal. Qual sua resposta padrão no SB?",
    weights: {
      FOLD: { aggression: 0, discipline: 1, pressure: 0, passivity: 2 },
      CALL: { aggression: 0, discipline: 1, pressure: 1, passivity: 2 },
      RAISE: { aggression: 3, discipline: 1, pressure: 3, passivity: 0 },
    },
  },
  {
    id: "turn-facing-barrel",
    street: "TURN",
    villains: [{ position: "CO", stack: 58, action: "BET", value: "18 BB" }],
    pot: { main: 31 },
    hero: { position: "BB", cards: "K♦ J♦", stack: 72 },
    board: "K♣ 8♥ 3♠ 9♠",
    prompt: "Você pagou flop com top pair e enfrenta segundo barrel de 58% do pote.",
    weights: {
      FOLD: { aggression: 0, discipline: 3, pressure: 0, passivity: 1 },
      CALL: { aggression: 0, discipline: 2, pressure: 1, passivity: 1 },
      RAISE: { aggression: 3, discipline: 0, pressure: 3, passivity: 0 },
    },
  },
  {
    id: "river-thin-value",
    street: "RIVER",
    villains: [{ position: "BB", stack: 47, action: "CHECK", value: "—" }],
    pot: { main: 36 },
    hero: { position: "BTN", cards: "Q♠ J♠", stack: 54 },
    board: "Q♥ 7♦ 4♠ 2♣ 6♣",
    prompt: "Vilão pagou flop e turn e dá check river. Você tem top pair e ação.",
    weights: {
      FOLD: { aggression: 0, discipline: 0, pressure: 0, passivity: 3 },
      CALL: { aggression: 0, discipline: 1, pressure: 0, passivity: 2 },
      RAISE: { aggression: 2, discipline: 1, pressure: 2, passivity: 0 },
    },
  },
  {
    id: "shortstack-jam",
    street: "PREFLOP",
    villains: [{ position: "CO", stack: 18, action: "ALL-IN", value: "18 BB" }],
    pot: { main: 20.5 },
    hero: { position: "BTN", cards: "A♠ T♦", stack: 43 },
    prompt: "CO empurra 18 BB e a ação chega limpa até você no BTN.",
    weights: {
      FOLD: { aggression: 0, discipline: 2, pressure: 0, passivity: 1 },
      CALL: { aggression: 1, discipline: 1, pressure: 2, passivity: 0 },
      RAISE: { aggression: 3, discipline: 0, pressure: 3, passivity: 0 },
    },
  },
  {
    id: "flop-monotone",
    street: "FLOP",
    villains: [{ position: "BB", stack: 91, action: "CHECK", value: "—" }],
    pot: { main: 9 },
    hero: { position: "BTN", cards: "A♣ K♦", stack: 96 },
    board: "K♣ 8♣ 3♣",
    prompt: "Flop monotone. Você tem top pair com A♣ e vilão checa.",
    weights: {
      FOLD: { aggression: 0, discipline: 0, pressure: 0, passivity: 3 },
      CALL: { aggression: 0, discipline: 1, pressure: 0, passivity: 2 },
      RAISE: { aggression: 2, discipline: 2, pressure: 2, passivity: 0 },
    },
  },
  {
    id: "river-overbet",
    street: "RIVER",
    villains: [{ position: "BTN", stack: 66, action: "OVERBET", value: "52 BB" }],
    pot: { main: 38 },
    hero: { position: "BB", cards: "K♥ Q♥", stack: 71 },
    board: "K♣ 9♦ 5♠ 4♥ 2♦",
    prompt: "Vilão usa overbet de 137% do pote no river. Você segura top pair Q kicker.",
    weights: {
      FOLD: { aggression: 0, discipline: 3, pressure: 0, passivity: 1 },
      CALL: { aggression: 0, discipline: 0, pressure: 3, passivity: 1 },
      RAISE: { aggression: 3, discipline: 0, pressure: 3, passivity: 0 },
    },
  },
];
