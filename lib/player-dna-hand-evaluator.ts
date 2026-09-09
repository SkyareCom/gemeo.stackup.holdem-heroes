import type {DecisionSizing} from "@/lib/player-dna";
import type {PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";

export type DecisionGrade="MELHOR LINHA"|"ACEITÁVEL"|"IMPRECISA"|"SEM REFERÊNCIA SUFICIENTE";
export type HandEvaluation={
  grade:DecisionGrade;
  confidence:number;
  recommended:string;
  frequencies:Partial<Record<PlayerAction,number>>;
  comment:string;
  math:string;
  source:string;
};

type Strategy={
  match:string[];
  frequencies:Partial<Record<PlayerAction,number>>;
  primary:PlayerAction[];
  secondary?:PlayerAction[];
  comment:string;
};

const STRATEGIES:Strategy[]=[
  {match:["BTN VS BB","3-BET POT"],frequencies:{FOLD:12,CALL:58,RAISE:27,"ALL-IN":3},primary:["CALL"],secondary:["RAISE"],comment:"Em pot 3-bet BTN vs BB, a defesa tende a concentrar valor no call e reservar raises para uma faixa menor e mais polarizada."},
  {match:["BLIND WAR","SB VS BB"],frequencies:{FOLD:8,CALL:37,RAISE:50,"ALL-IN":5},primary:["RAISE"],secondary:["CALL"],comment:"Em guerra de blinds, ranges largos elevam a frequência de agressão; raise e call absorvem a maior parte da estratégia."},
  {match:["CO VS BTN","SRP"],frequencies:{FOLD:5,CALL:68,RAISE:24,"ALL-IN":3},primary:["CALL"],secondary:["RAISE"],comment:"Em single-raised pot CO vs BTN, a continuidade costuma ser dominada por call, com raises seletivos para valor e blefes fortes."},
  {match:["MULTIWAY","BB VS HJ VS BTN"],frequencies:{FOLD:24,CALL:62,RAISE:11,"ALL-IN":3},primary:["CALL"],secondary:["FOLD"],comment:"Multiway reduz o incentivo a inflar o pote com mãos médias; calls ganham peso e raises exigem seleção mais forte."},
  {match:["CO VS BB","2ND BARREL"],frequencies:{FOLD:31,CALL:57,RAISE:10,"ALL-IN":2},primary:["CALL"],secondary:["FOLD"],comment:"Contra segundo barrel, bluff-catchers e mãos médias frequentemente preferem call a transformar valor de showdown em raise."},
  {match:["BTN VS BB","THIN VALUE"],frequencies:{CHECK:34,BET:62,RAISE:3,"ALL-IN":1},primary:["BET"],secondary:["CHECK"],comment:"Em thin value BTN vs BB, apostar pequeno/médio captura valor de uma faixa ampla sem precisar polarizar excessivamente."},
  {match:["BTN VS BB","OVERBET"],frequencies:{FOLD:39,CALL:56,RAISE:4,"ALL-IN":1},primary:["CALL"],secondary:["FOLD"],comment:"Contra overbet, a defesa é mais seletiva: calls fortes convivem com folds relevantes; raises permanecem raros."},
  {match:["SIDE POT","CO VS BTN VS SB"],frequencies:{FOLD:4,CALL:39,RAISE:52,"ALL-IN":5},primary:["RAISE"],secondary:["CALL"],comment:"Com side pot e ranges assimétricos, mãos fortes ganham incentivo para extrair valor imediatamente da faixa ainda ativa."},
  {match:["EARLY GAME","UTG VS CO VS SB"],frequencies:{FOLD:5,CALL:24,RAISE:66,"ALL-IN":5},primary:["RAISE"],secondary:["CALL"],comment:"Stacks profundos no início do torneio favorecem construção de pote com a parte forte da faixa, preservando calls com mãos de realização."},
  {match:["MID GAME","BLIND WAR"],frequencies:{FOLD:9,CALL:33,RAISE:52,"ALL-IN":6},primary:["RAISE"],secondary:["CALL"],comment:"No mid game, blind war mantém ranges largos e elevada pressão de fold equity, sustentando uma estratégia agressiva."},
  {match:["BOLHA","CO VS BTN"],frequencies:{FOLD:36,CALL:59,RAISE:4,"ALL-IN":1},primary:["CALL"],secondary:["FOLD"],comment:"Na bolha, o ICM reduz a tolerância a variância e comprime raises marginais; calls/folds absorvem mais frequência."},
  {match:["ITM","BTN VS BB","COMBO DRAW"],frequencies:{FOLD:2,CALL:38,RAISE:55,"ALL-IN":5},primary:["RAISE"],secondary:["CALL"],comment:"Combo draws realizam equity bem sob agressão e podem usar raise para somar fold equity à equidade bruta."},
  {match:["FT","MULTIWAY"],frequencies:{FOLD:61,CALL:34,RAISE:4,"ALL-IN":1},primary:["FOLD"],secondary:["CALL"],comment:"Na mesa final multiway, a pressão de ICM aumenta fortemente o custo de erros e reduz a frequência de confrontos marginais."},
  {match:["FT","SIDE POT","BTN VS SB VS BB"],frequencies:{FOLD:3,CALL:41,RAISE:51,"ALL-IN":5},primary:["RAISE"],secondary:["CALL"],comment:"Com side pot em FT, mãos fortes podem pressionar a faixa ainda disputando fichas enquanto preservam valor contra ranges comprimidos."},
  {match:["BOLHA","BLUFF CATCH"],frequencies:{FOLD:54,CALL:42,RAISE:3,"ALL-IN":1},primary:["FOLD"],secondary:["CALL"],comment:"Bluff-catchers perdem valor sob pressão de ICM; a faixa de bluff necessária para justificar calls fica mais exigente."},
  {match:["MID GAME","BTN VS BB","IP"],frequencies:{CHECK:57,BET:38,RAISE:4,"ALL-IN":1},primary:["CHECK"],secondary:["BET"],comment:"Em posição, checks preservam showdown e protegem a faixa; bets aparecem de forma seletiva conforme textura e vantagem de range."},
];

function scenarioText(spot:PlayerDnaSpot){return spot.scenario.join(" / ").toUpperCase()}
function findStrategy(spot:PlayerDnaSpot){const text=scenarioText(spot);return STRATEGIES.find(s=>s.match.every(token=>text.includes(token)))}
function facingBet(spot:PlayerDnaSpot){
  const hero=spot.players.find(p=>p.hero);if(!hero)return null;
  const previous=spot.players.filter(p=>!p.hero&&p.value>0).map(p=>p.value);
  if(!previous.length)return null;
  const call=Math.max(...previous);
  return {call,pot:spot.pot.main};
}
function mathNote(spot:PlayerDnaSpot){
  const facing=facingBet(spot);if(!facing||facing.call<=0)return "SEM CÁLCULO EXATO ADICIONAL NESTA DECISÃO.";
  const required=facing.call/(facing.pot+facing.call)*100;
  return `POT ODDS APROX.: ${required.toFixed(1)}% DE EQUITY MÍNIMA PARA UM CALL BREAK-EVEN, ANTES DE RAKE/ICM/REALIZAÇÃO.`;
}
function quality(action:PlayerAction,strategy:Strategy){
  if(strategy.primary.includes(action))return "MELHOR LINHA" as const;
  if(strategy.secondary?.includes(action))return "ACEITÁVEL" as const;
  return "IMPRECISA" as const;
}

export function evaluateHandDecision(spot:PlayerDnaSpot,action:PlayerAction,sizing?:DecisionSizing|null):HandEvaluation{
  const strategy=findStrategy(spot);
  if(!strategy){
    return {grade:"SEM REFERÊNCIA SUFICIENTE",confidence:0,recommended:"---",frequencies:{},comment:"O motor não possui referência calibrada suficiente para atribuir uma recomendação confiável a este spot. A decisão é registrada no Player DNA, mas não é classificada como correta/incorreta.",math:mathNote(spot),source:"MOTOR DETERMINÍSTICO · SEM REFERÊNCIA CALIBRADA"};
  }
  const grade=quality(action,strategy);
  const selected=sizing?`${action} ${sizing}`:action;
  const recommended=strategy.primary.join(" / ");
  const comment=grade==="MELHOR LINHA"?`${selected}: decisão alinhada à faixa de maior frequência do modelo de referência. ${strategy.comment}`:grade==="ACEITÁVEL"?`${selected}: linha defensável e presente no mix, embora abaixo da frequência principal. ${strategy.comment}`:`${selected}: linha de baixa frequência no modelo de referência. ${strategy.comment}`;
  return {grade,confidence:0,recommended,frequencies:strategy.frequencies,comment,math:mathNote(spot),source:"REFERÊNCIA ESTRATÉGICA CALIBRADA · PENDENTE DE BENCHMARK CONTRA SOLVER"};
}
