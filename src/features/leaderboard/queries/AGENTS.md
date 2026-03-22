# AGENTS.md — Padroes de queries de leaderboard

Este arquivo define convencoes para `src/features/leaderboard/queries`.

## Responsabilidades

- Queries acessam banco e retornam contratos prontos para consumo de UI/procedures.
- Tipos de retorno compartilhados devem ser declarados no proprio arquivo da query.
- Agregacoes numericas devem ser normalizadas explicitamente para `number`.
- Quando uma query precisar de multiplas consultas independentes (ex: lista + metricas), executar em paralelo com `Promise.all`.

## Query de metricas da home

- `get-home-metrics.ts` e a fonte de verdade para `totalRoastedCodes` e `averageScore`.
- A query deve permanecer agnostica de camada HTTP e de detalhes de renderizacao.
- Mudancas no contrato devem ser refletidas primeiro aqui e depois na procedure `metrics.homepage`.

## Query de leaderboard da home

- `get-home-leaderboard.ts` retorna os 3 piores scores e metricas de rodape da homepage.
- A consulta dos entries e das metricas deve ser paralela usando `Promise.all`.
