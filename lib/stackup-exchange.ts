export const STACKUP_EXCHANGE_VERSION="1.1.0" as const;
export const STACKUP_EXCHANGE_FAMILY="STACKUP_POKER_PERFORMANCE" as const;

export type StackupSource="PLAYER_DNA"|"HAND_REVIEW"|"TRAINING_APP"|"IMPORTED"|"REAL_HAND"|"MANUAL"|"AI_ASSISTANT";
export type StackupGameMode="CASH"|"TORNEIO";
export type StackupStreet="PREFLOP"|"FLOP"|"TURN"|"RIVER";
export type StackupTaskStatus="PENDENTE"|"EM_ESTUDO"|"CONCLUIDO";
export type StackupPriority="ALTA"|"MEDIA"|"BAIXA";
export type StackupDecisionOutcome="CORRETA"|"INCORRETA"|"PARCIAL"|"NAO_AVALIADA";
export type StackupReviewReason="ERRO"|"TIMEOUT"|"MARCADOR"|"SPACED_REPETITION"|"IMPORTADO"|"IA";

export type StackupPlayerRef={playerId:string;externalIds?:Record<string,string>};
export type StackupTournamentContext={tournamentId?:string|null;level?:number|null;blindSmall?:number|null;blindBig?:number|null;ante?:number|null;playersRemaining?:number|null;paidPlaces?:number|null;averageStackBb?:number|null;heroStackBb?:number|null;icm?:boolean;bubble?:boolean;finalTable?:boolean;payouts?:number[]};
export type StackupActionRecord={actor:string;position?:string|null;action:string;amount?:number|null;amountBb?:number|null;potBefore?:number|null;street:StackupStreet;sequence:number;allIn?:boolean};
export type StackupDecisionMetrics={outcome:StackupDecisionOutcome;decisionMs?:number|null;timedOut?:boolean;attemptNumber?:number|null;confidenceSelfReported?:number|null;evDelta?:number|null;equity?:number|null;potOdds?:number|null;requiredEquity?:number|null;score?:number|null};
export type StackupReviewState={reviewRequired:boolean;reason?:StackupReviewReason|null;reviewCount?:number;lastReviewedAt?:number|null;nextReviewAt?:number|null;intervalDays?:number|null;easeFactor?:number|null;mastery?:number|null};
export type StackupSpotContext={tableSize?:number|null;heroPosition?:string|null;villainPositions?:string[];heroCards?:string[];board?:string[];stacks?:Record<string,number>;effectiveStack?:number|null;effectiveStackBb?:number|null;pot?:number|null;potBb?:number|null;tournament?:StackupTournamentContext|null};

export type StackupSpotExchange={
 exchangeVersion:typeof STACKUP_EXCHANGE_VERSION|string;id:string;source:StackupSource;sourceApp:string;sourceRecordId?:string|null;player:StackupPlayerRef;mode:StackupGameMode;street:StackupStreet;
 context?:StackupSpotContext;heroPosition?:string|null;heroCards?:string[];board?:string[];stacks?:Record<string,number>;pot?:number|null;
 actions:StackupActionRecord[];selectedAction?:string|null;expectedAction?:string|null;acceptedActions?:string[];correct?:boolean|null;decision?:StackupDecisionMetrics|null;review?:StackupReviewState|null;
 tags:string[];leakTags:string[];trainingTags:string[];conceptTags?:string[];difficulty?:number|null;confidence?:number|null;occurredAt:number;metadata?:Record<string,unknown>;
};

export type StackupEvidenceExchange={id:string;player:StackupPlayerRef;source:StackupSource;sourceRecordId:string;analysisId?:string|null;metric:string;value:number;weight:number;confidence:number;sampleSize?:number|null;tags:string[];explanation:string;createdAt:number};
export type StackupLeakExchange={id:string;player:StackupPlayerRef;analysisId?:string|null;title:string;description:string;severity:StackupPriority;confidence:number;sourceEvidenceIds:string[];trainingTags:string[];firstSeenAt:number;lastSeenAt:number;status:"ATIVO"|"MELHORANDO"|"RESOLVIDO"};
export type StackupTrainingPrescription={id:string;player:StackupPlayerRef;createdBy:StackupSource;analysisId?:string|null;leakId?:string|null;title:string;reason:string;priority:StackupPriority;trainingTags:string[];conceptTags?:string[];targetSpots:number;mode?:StackupGameMode|null;street?:StackupStreet|null;positions?:string[];difficultyMin?:number|null;difficultyMax?:number|null;timerSeconds?:number|null;reviewWrongAnswers?:boolean;dueAt?:number|null;status:StackupTaskStatus;createdAt:number};
export type StackupTrainingSession={id:string;prescriptionId?:string|null;player:StackupPlayerRef;sourceApp:string;mode:StackupGameMode;spotIds:string[];startedAt:number;completedAt?:number|null;timerSeconds?:number|null;metadata?:Record<string,unknown>};
export type StackupTrainingResult={id:string;prescriptionId?:string|null;sessionId?:string|null;player:StackupPlayerRef;sourceApp:string;totalSpots:number;correctSpots:number;incorrectSpots?:number;timeouts?:number;accuracy:number;averageDecisionMs?:number|null;score?:number|null;leakTags:string[];masteredTags?:string[];startedAt:number;completedAt:number};
export type StackupEvolutionSnapshot={id:string;player:StackupPlayerRef;analysisId?:string|null;createdAt:number;confidence:number;metrics:Record<string,number>;activeLeaks:string[];improvedLeaks:string[];resolvedLeaks?:string[];trainingVolume?:number;accuracy?:number|null};
export type StackupAnalysisExchange={id:string;player:StackupPlayerRef;source:StackupSource;mode:StackupGameMode;name:string;status:"EM_ANDAMENTO"|"CONCLUIDA"|"REAVALIACAO";sampleSize:number;confidence:number;archetype?:string|null;secondaryArchetype?:string|null;metricSnapshot:Record<string,number>;evidenceIds:string[];leakIds:string[];prescriptionIds:string[];createdAt:number;completedAt?:number|null};

export type StackupExchangeEnvelope={exchangeFamily?:typeof STACKUP_EXCHANGE_FAMILY;exchangeVersion:string;exportedAt:number;producer:string;producerVersion?:string|null;player:StackupPlayerRef;analyses?:StackupAnalysisExchange[];spots?:StackupSpotExchange[];evidences?:StackupEvidenceExchange[];leaks?:StackupLeakExchange[];prescriptions?:StackupTrainingPrescription[];trainingSessions?:StackupTrainingSession[];trainingResults?:StackupTrainingResult[];evolution?:StackupEvolutionSnapshot[];metadata?:Record<string,unknown>};

export function createExchangeEnvelope(input:Omit<StackupExchangeEnvelope,"exchangeFamily"|"exchangeVersion"|"exportedAt">):StackupExchangeEnvelope{return{exchangeFamily:STACKUP_EXCHANGE_FAMILY,exchangeVersion:STACKUP_EXCHANGE_VERSION,exportedAt:Date.now(),...input}}
export function isStackupExchangeEnvelope(value:unknown):value is StackupExchangeEnvelope{if(!value||typeof value!=="object")return false;const row=value as Partial<StackupExchangeEnvelope>;return typeof row.exchangeVersion==="string"&&row.exchangeVersion.split(".")[0]===STACKUP_EXCHANGE_VERSION.split(".")[0]&&typeof row.producer==="string"&&!!row.player&&typeof row.player.playerId==="string"}
export function exchangeSummary(row:StackupExchangeEnvelope){return{analyses:row.analyses?.length??0,spots:row.spots?.length??0,evidences:row.evidences?.length??0,leaks:row.leaks?.length??0,prescriptions:row.prescriptions?.length??0,trainingSessions:row.trainingSessions?.length??0,trainingResults:row.trainingResults?.length??0,evolution:row.evolution?.length??0}}
