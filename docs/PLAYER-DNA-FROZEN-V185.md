# PLAYER DNA — FROZEN V185

Status: **PRONTO / CONGELADO**

Data: 2026-08-29

Este documento registra a decisão de produto de não alterar mais o módulo PLAYER DNA sem uma solicitação explícita posterior do proprietário do projeto.

## Baseline validada

- Harness final: `stackup_holdem_ai_solver_teste_v185.html`
- Motor matemático: V185
- Stress test executado antes do congelamento: **50.000 cenários / 0 falhas**
- Torneio: valores monetários/apostas exibidos em **BB**
- Cash: valores exibidos no formato **K**
- Raise sizing: dois sizings distintos quando há espaço legal, separados de ALL-IN
- Pot accounting, call incremental, pot odds, SPR, minimum raise-to e effective stack auditados
- Cartas abertas: ♥/♦ vermelhas sobre branco; ♣/♠ pretas sobre branco
- Tipografia oficial do app nesta baseline visual: **Chakra Petch**

## Casos de calibração do sizing

- Open 3 BB + 1 caller, Hero BB/OOP, 100 BB: **15 BB / 18 BB**
- Open 3 BB sem caller, Hero IP, 100 BB: **9 BB / 12 BB**
- Flop, bet 10 em pot-before 20, 100 BB: **30 BB / 44 BB**

## Regra de congelamento

Não refatorar, redesenhar, reescrever ou alterar o comportamento do PLAYER DNA / motor matemático congelado como parte de trabalhos em outros módulos. Mudanças futuras neste módulo exigem instrução explícita para reabrir o PLAYER DNA.
