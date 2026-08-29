export type HandGameMode="CASH"|"TORNEIO";
export type TournamentType="MTT"|"SNG"|"BOUNTY"|"MULTIDAY"|"HIGH ROLLER"|"REGULAR"|"TURBO";
export type TournamentPhase="EARLY"|"MID"|"BOLHA ITM"|"BOLHA FT"|"ITM"|"FT";
export type FieldLeft="10%"|"20%"|"30%"|"50%";
export type TableSize=2|6|8|9|10;
export type Position="SB"|"BB"|"UTG1"|"UTG2"|"MP1"|"MP2"|"LJ"|"HJ"|"CO"|"BTN";
export type Street="PREFLOP"|"FLOP"|"TURN"|"RIVER";
export type HandAction="FOLD"|"CHECK"|"CALL"|"RAISE"|"3-BET"|"4-BET"|"ALL-IN";
export type Rank="2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"T"|"J"|"Q"|"K"|"A";
export type Suit="♠"|"♥"|"♦"|"♣";
export type Card=`${Rank}${Suit}`;

export interface HandReviewInput{
  game:HandGameMode;
  tournamentTypes:TournamentType[];
  tournamentPhase:TournamentPhase|null;
  fieldLeft:FieldLeft|null;
  tableSize:TableSize|null;
  heroPosition:Position|null;
  villainPositions:Position[];
  heroStack:number|null;
  villainStacks:Partial<Record<Position,number>>;
  street:Street;
  board:Card[];
  heroCards:Card[];
  villainActions:Partial<Record<Position,HandAction>>;
  heroAction:HandAction|null;
  notes:string;
}

export interface HandReviewValidation{
  valid:boolean;
  missing:string[];
  conflicts:string[];
}

export const positions:Position[]=["SB","BB","UTG1","UTG2","MP1","MP2","LJ","HJ","CO","BTN"];
export const ranks:Rank[]=["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
export const suits:Suit[]=["♠","♥","♦","♣"];
export const actions:HandAction[]=["FOLD","CHECK","CALL","RAISE","3-BET","4-BET","ALL-IN"];
export const tournamentTypes:TournamentType[]=["MTT","SNG","BOUNTY","MULTIDAY","HIGH ROLLER","REGULAR","TURBO"];
export const tournamentPhases:TournamentPhase[]=["EARLY","MID","BOLHA ITM","BOLHA FT","ITM","FT"];
export const fieldLeftOptions:FieldLeft[]=["10%","20%","30%","50%"];
export const tableSizes:TableSize[]=[2,6,8,9,10];
export const streets:Street[]=["PREFLOP","FLOP","TURN","RIVER"];

export function requiredBoardCards(street:Street){
  if(street==="PREFLOP")return 0;
  if(street==="FLOP")return 3;
  if(street==="TURN")return 4;
  return 5;
}

export function validateHandReview(input:HandReviewInput):HandReviewValidation{
  const missing:string[]=[];
  const conflicts:string[]=[];
  if(input.game==="TORNEIO"){
    if(input.tournamentTypes.length===0)missing.push("TIPO DE TORNEIO");
    if(!input.tournamentPhase)missing.push("FASE DO TORNEIO");
    if(!input.fieldLeft)missing.push("FIELD LEFT");
  }
  if(!input.tableSize)missing.push("JOGADORES POR MESA");
  if(!input.heroPosition)missing.push("POSIÇÃO DO HERÓI");
  if(input.villainPositions.length===0)missing.push("AO MENOS UM VILÃO");
  if(!(input.heroStack&&input.heroStack>0))missing.push("STACK DO HERÓI");
  input.villainPositions.forEach(position=>{
    if(!(input.villainStacks[position]&&input.villainStacks[position]!>0))missing.push(`STACK ${position}`);
    if(!input.villainActions[position])missing.push(`AÇÃO ${position}`);
  });
  const heroCards=input.heroCards.filter(Boolean);
  if(heroCards.length!==2)missing.push("2 CARTAS DO HERÓI");
  const required=requiredBoardCards(input.street);
  const board=input.board.filter(Boolean);
  if(board.length!==required)missing.push(`BOARD COMPLETO NO ${input.street}`);
  if(!input.heroAction)missing.push("AÇÃO DO HERÓI");

  if(input.heroPosition&&input.villainPositions.includes(input.heroPosition))conflicts.push("HERÓI E VILÃO NÃO PODEM OCUPAR A MESMA POSIÇÃO");
  const allCards=[...heroCards,...board];
  if(new Set(allCards).size!==allCards.length)conflicts.push("A MESMA CARTA FOI USADA MAIS DE UMA VEZ");
  if(input.tableSize&&input.villainPositions.length+1>input.tableSize)conflicts.push("JOGADORES INFORMADOS EXCEDEM O TAMANHO DA MESA");

  return{valid:missing.length===0&&conflicts.length===0,missing:[...new Set(missing)],conflicts:[...new Set(conflicts)]};
}

export function effectiveStack(input:HandReviewInput){
  const stacks=[input.heroStack,...input.villainPositions.map(position=>input.villainStacks[position])].filter((value):value is number=>typeof value==="number"&&value>0);
  return stacks.length?Math.min(...stacks):null;
}

export function handReviewSummary(input:HandReviewInput){
  const tournament=input.game==="TORNEIO"?`${input.tournamentTypes.join(" + ")} · ${input.tournamentPhase} · FIELD LEFT ${input.fieldLeft}`:"CASH";
  return{
    modality:tournament,
    table:input.tableSize?`${input.tableSize}-MAX`:"—",
    hero:input.heroPosition?`${input.heroPosition} · ${input.heroCards.filter(Boolean).join(" ")} · ${input.heroStack ?? "—"} BB`:"—",
    villains:input.villainPositions.map(position=>`${position} ${input.villainStacks[position] ?? "—"} BB · ${input.villainActions[position] ?? "—"}`).join(" · "),
    street:input.street,
    board:input.board.filter(Boolean).length?input.board.filter(Boolean).join(" "):"PREFLOP",
    heroAction:input.heroAction??"—",
    effectiveStack:effectiveStack(input),
  };
}
