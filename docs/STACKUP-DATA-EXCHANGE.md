# STACKUP DATA / EXCHANGE FOUNDATION

## Objetivo

Permitir que os aplicativos Stackup permaneçam independentes, mas compartilhem a mesma identidade de jogador, spots, evidências, diagnósticos, prescrições de treino, resultados e evolução.

## Regra arquitetural

- Git sincroniza código, não dados operacionais.
- Os aplicativos não dependem diretamente um do outro.
- Ambos dependem do contrato STACKUP EXCHANGE.
- O frontend não deve acessar o banco central diretamente.
- A integração definitiva será feita por API/backend compartilhado + PostgreSQL.
- Importação/exportação JSON permanece como fallback e mecanismo de portabilidade.

## Fluxo alvo

TRAINING APP -> API -> STACKUP DATA STORE <- API <- HOLD'EM SOLVER

1. O app de treino registra tentativas e spots relevantes.
2. Esses registros se tornam evidências para PLAYER DNA / HAND REVIEW.
3. O Solver atualiza confiança, leaks e evolução.
4. O Solver gera prescrições de treino.
5. O app de treino consome as prescrições e monta sessões específicas.
6. Os resultados retornam ao Solver e alimentam a próxima avaliação.

## Contrato v1

O arquivo `lib/stackup-exchange.ts` define inicialmente:

- `StackupSpotExchange`
- `StackupEvidenceExchange`
- `StackupTrainingPrescription`
- `StackupTrainingResult`
- `StackupEvolutionSnapshot`
- `StackupExchangeEnvelope`

Todos os registros carregam identidade, origem e timestamps suficientes para auditoria e deduplicação.

## Origem das evidências

Fontes padronizadas:

- PLAYER_DNA
- HAND_REVIEW
- TRAINING_APP
- IMPORTED
- REAL_HAND

A origem deve ser preservada no relatório para explicar como cada diagnóstico foi produzido e permitir pesos de confiança diferentes no futuro.

## Persistência por fases

### Fase 1 — agora

Continuar com persistência local nos módulos atuais, mas produzir objetos compatíveis com o contrato STACKUP EXCHANGE.

### Fase 2 — após conclusão dos módulos

Criar backend compartilhado e PostgreSQL central. Os módulos passam a enviar/ler os mesmos objetos pela API.

### Fase 3 — integração com app de treino

Implementar importação/exportação do mesmo contrato no segundo aplicativo e, em seguida, sincronização online.

## Entidades previstas para o banco central

- users
- player_profiles
- analyses
- analysis_evidence
- hands
- spots
- spot_attempts
- leaks
- training_prescriptions
- training_sessions
- checklist_items
- evolution_snapshots

## Próxima implementação

1. Adaptar PLAYER DNA para exportar/importar `StackupExchangeEnvelope`.
2. Mapear checklist atual para `StackupTrainingPrescription`.
3. Fazer HAND REVIEW emitir `StackupEvidenceExchange` e `StackupSpotExchange`.
4. Só então desenhar schema PostgreSQL e endpoints da API.
