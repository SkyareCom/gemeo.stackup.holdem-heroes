export const STACKUP_EXCHANGE_VERSION="1.0.0" as const;

export type StackupSource="PLAYER_DNA"|"HAND_REVIEW"|"TRAINING_APP"|"IMPORTED"|"REAL_HAND";
export type StackupGameMode="CASH"|"TORNEIO";
export type StackupStreet="PREFLOP"|"FLOP"|"TURN"|"RIVER";
export type StackupTaskStatus="PENDENTE"|"EM_ESTUDO"|"CONCLUIDO";
export type StackupPriority="ALTA"|"MEDIA"|"BAIXA";

export type StackupPlayerRef={
  playerId:string;
  externalIds?:Record<string,string>;
};

export type StackupActionRecord={
  actor:string;
  action:string;
  amount?:number|null;
  street:StackupStreet;
  sequence:number;
};

export type StackupSpotExchange={
  exchangeVersion:typeof STACKUP_EXCHANGE_VERSION;
  id:string;
  source:StackupSource;
  sourceApp:string;
  sourceRecordId?:string|null;
  player:StackupPlayerRef;
  mode:StackupGameMode;
  street:StackupStreet;
  heroPosition?:string|null;
  heroCards?:string[];
  board?:string[];
  stacks?:Record<string,number>;
  pot?:number|null;
  actions:StackupActionRecord[];
  selectedAction?:string|null;
  expectedAction?:string|null;
  correct?:boolean|null;
  tags:string[];
  leakTags:string[];
  trainingTags:string[];
  difficulty?:number|null;
  confidence?:number|null;
  occurredAt:number;
  metadata?:Record<string,unknown>;
};

export type StackupEvidenceExchange={
  id:string;
  player:StackupPlayerRef;
  source:StackupSource;
  sourceRecordId:string;
  metric:string;
  value:number;
  weight:number;
  confidence:number;
  tags:string[];
  explanation:string;
  createdAt:number;
};

export type StackupTrainingPrescription={
  id:string;
  player:StackupPlayerRef;
  createdBy:StackupSource;
  analysisId?:string|null;
  title:string;
  reason:string;
  priority:StackupPriority;
  trainingTags:string[];
  targetSpots:number;
  dueAt?:number|null;
  status:StackupTaskStatus;
  createdAt:number;
};

export type StackupTrainingResult={
  id:string;
  prescriptionId:string;
  player:StackupPlayerRef;
  sourceApp:string;
  totalSpots:number;
  correctSpots:number;
  accuracy:number;
  averageDecisionMs?:number|null;
  leakTags:string[];
  startedAt:number;
  completedAt:number;
};

export type StackupEvolutionSnapshot={
  id:string;
  player:StackupPlayerRef;
  analysisId?:string|null;
  createdAt:number;
  confidence:number;
  metrics:Record<string,number>;
  activeLeaks:string[];
  improvedLeaks:string[];
};

export type StackupExchangeEnvelope={
  exchangeVersion:typeof STACKUP_EXCHANGE_VERSION;
  exportedAt:number;
  producer:string;
  player:StackupPlayerRef;
  spots?:StackupSpotExchange[];
  evidences?:StackupEvidenceExchange[];
  prescriptions?:StackupTrainingPrescription[];
  trainingResults?:StackupTrainingResult[];
  evolution?:StackupEvolutionSnapshot[];
};

export function createExchangeEnvelope(input:Omit<StackupExchangeEnvelope,"exchangeVersion"|"exportedAt">):StackupExchangeEnvelope{
  return{exchangeVersion:STACKUP_EXCHANGE_VERSION,exportedAt:Date.now(),...input};
}

export function isStackupExchangeEnvelope(value:unknown):value is StackupExchangeEnvelope{
  if(!value||typeof value!=="object")return false;
  const row=value as Partial<StackupExchangeEnvelope>;
  return row.exchangeVersion===STACKUP_EXCHANGE_VERSION&&typeof row.producer==="string"&&!!row.player&&typeof row.player.playerId==="string";
}
