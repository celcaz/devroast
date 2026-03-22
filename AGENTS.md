# AGENTS.md — Guia global do projeto

Este arquivo centraliza padroes globais de arquitetura e implementacao.

## App Router e componentes

- `src/app/**/page.tsx` deve permanecer Server Component por padrao.
- Interatividade fica em componentes de feature com `"use client"`.
- Quando um componente client precisar renderizar conteudo vindo do servidor, prefira slots tipados com `ReactNode` (ex: `metricsSlot`).

## Padrao de dados atual (fase tRPC server-only)

- Nesta fase usamos tRPC apenas no servidor com `createCaller`.
- A porta de entrada HTTP de tRPC deve ficar em `src/app/api/trpc/[trpc]/route.ts`.
- O acesso em Server Components deve passar por `getCaller` em `src/trpc/server.ts`.
- Ainda nao usar client tRPC + TanStack Query/hidratacao SSR, salvo mudanca explicita de escopo.
- Procedures devem ser declaradas por dominio (`metrics`, `leaderboard`, `roast`) e agregadas no `appRouter`.

## Organizacao de dominio

- Queries de banco ficam em `src/features/<feature>/queries`.
- Procedures tRPC encapsulam essas queries e ficam em `src/trpc/routers/<dominio>.ts`.
- O `appRouter` agrega routers de dominio em `src/trpc/routers/_app.ts`.

## Convencoes de modelagem de dados

- Agregacoes SQL devem retornar tipos normalizados para a UI (converter para `number` quando necessario).
- Contratos de retorno devem ser tipados localmente no arquivo de query quando usados por mais de um consumidor.
- Em queries com consultas independentes (ex: entries e metricas), executar em paralelo com `Promise.all`.

## Dependencias e bibliotecas

- Preferir adicionar dependencias pequenas e focadas no problema atual.
- Para animacao de numeros em UI, usar `@number-flow/react` em componente client dedicado.

## Features recentes (baseline atual)

- Homepage ja consome `metrics.homepage` via `getCaller()` em Server Component.
- Metricas da home devem continuar sendo renderizadas em componente server dedicado e injetadas na area client por slot (`metricsSlot`).
- Sempre que houver agregacao numerica de banco para UI, manter normalizacao explicita para `number` na query.
