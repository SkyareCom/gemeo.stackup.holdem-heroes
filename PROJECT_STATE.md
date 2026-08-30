# STACKUP HOLD'EM SOLVER — CANONICAL PROJECT STATE

> Este arquivo é a referência curta do projeto. Decisões antigas, nomes provisórios e discussões descartadas não devem ser reutilizados quando conflitarem com este estado.

## OBJETIVO
Finalizar o STACKUP HOLD'EM SOLVER como aplicativo funcional de inteligência/diagnóstico de poker, aproveitando o código já construído e sem reconstruir o que já existe.

## IDENTIDADE VISUAL — CONGELADA
- Reutilizar exatamente o template/tela inicial existente.
- Manter paleta, tipografia, hierarquia, proporções, espaçamentos e padrões visuais existentes.
- Não criar novo design durante a finalização funcional.
- Tipografia definida para o app: Google Chakra Petch.
- Não introduzir degradês novos. A estética existente é a referência.

## MÓDULOS DO SOLVER
1. DESCOBRIR PERFIL — PLAYER DNA
2. ANÁLISE DE MÃOS — AI HAND REVIEW
3. PERGUNTE À IA — POKER ASSISTANT
4. MATEMÁTICA — POKER MATH LAB
5. PLAYER EVOLUTION — consolidação de evidências, leaks, prescrições e resultados.

## RESPONSABILIDADE DOS DOIS APPS
- SOLVER = diagnostica, analisa, explica, identifica leaks, mede confiança e PRESCREVE treinos.
- APP DE TREINO = executa os spots/treinos e devolve resultados.
- Não duplicar no Solver o motor de treino já existente no outro app.

Fluxo alvo:
SOLVER → prescrição/spot → APP DE TREINO → resultado → PLAYER EVOLUTION → novas prescrições.

## PLAYER EVOLUTION
Deve consolidar:
- análises e histórico;
- Player DNA;
- mãos analisadas;
- evidências estatísticas;
- leaks ativos/resolvidos;
- prescrições de treino;
- resultados importados do app de treino;
- evolução e confiança.

Prescrições devem poder ser enviadas ao app de treino através do formato de intercâmbio já existente.

## DAILY PULSE
Conceito mantido como reforço contínuo, sem virar módulo de treino duplicado.
Pode gerar:
- quiz rápido;
- spot rápido;
- conceito;
- curiosidade matemática;
- revisão de leak.

Preferências previstas: usuário pode programar múltiplos envios por dia e canais como WhatsApp quando a integração estiver disponível.

## HAND REVIEW / MOTOR MATEMÁTICO
- Cálculos determinísticos devem permanecer no código; IA apenas interpreta/explica.
- Não apresentar estimativa como fato.
- Quando dados forem insuficientes, declarar isso.
- Torneio: apostas/valores sempre em BB.
- Cash: valores em moeda, com formato K quando aplicável.
- Corrigir sizing sempre considerando pot, ações e apostas dos vilões; evitar botões com apostas duplicadas ou sizing incoerente.
- Ações do Hand Review devem ser exportáveis para o intercâmbio.

## CARTAS / UI
- Cartas abertas: copas e ouros em vermelho; paus e espadas em preto; fundo branco.
- Evitar fundo branco estranho entre cartas dos jogadores.
- Números dos cards: 01, 02, 03, 04 em 30px, verde escuro conforme decisão visual anterior.
- Não alterar a composição visual existente sem necessidade funcional.

## ARMAZENAMENTO
Análises, relatórios, histórico, Player DNA, leaks, prescrições e resultados devem persistir localmente no modelo de store/exchange já existente, evoluindo-o em vez de criar stores paralelos.

## RELATÓRIO / ANÁLISE
O conceito foi unificado: análise deve poder gerar um diagnóstico completo do jogador, incluindo:
- modelo de jogo/perfil;
- dados estatísticos;
- ações/evidências que sustentam o resultado;
- explicação de como o resultado foi obtido;
- nível de confiança;
- fraquezas/leaks;
- melhorias sugeridas;
- treinos específicos prescritos para o app de treino;
- checklist persistente de tarefas/estudos;
- evolução ao longo do tempo.

Relatórios devem poder ser exportados como arquivo para o usuário.

## INTERCÂMBIO ENTRE APPS
Existe a base `lib/stackup-exchange.ts` e código de exchange para Player DNA/Hand Review. Usar esse contrato como núcleo da integração. Evitar integração via Git: Git é versionamento, não banco de dados nem canal de runtime.

## ESTADO FUNCIONAL JÁ CONSTRUÍDO
- Shell principal e módulos existentes.
- Player DNA exchange.
- Player Evolution workspace/store.
- Prescrição externa de treino.
- Daily Pulse candidate/queue logic.
- Hand Review exchange.
- Correções recentes de tipagem nos exchanges.
- CI corrigido para não depender de package-lock inexistente.

Último commit funcional de código: `9f38080343eb1970cbf4dd9ef3a39b7a5789264d`.

## SPRINT ATUAL
Prioridade absoluta:
1. fazer o build passar;
2. corrigir erros funcionais dos módulos existentes;
3. validar navegação e botões;
4. validar persistência de análise/histórico;
5. validar Player Evolution;
6. validar prescrição/exportação para treino;
7. validar exportação de relatório;
8. gerar versão de testes funcional.

Não parar para redesenhar. Não adicionar módulos apenas por ideia. Primeiro finalizar o que já existe.

## REGRA DE CONTINUIDADE
Quando esta conversa for retomada, ler este arquivo antes de tomar decisões de arquitetura. Ele substitui o histórico longo da conversa para fins de continuidade do projeto.
