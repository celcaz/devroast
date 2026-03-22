# Spec: tRPC como camada de API com SSR (Next.js App Router)

## Contexto

Hoje o projeto usa queries/actions diretas no app. Queremos adotar tRPC como camada única de API/back-end, mantendo tipagem fim-a-fim e integração correta com SSR/RSC no Next.js.

## Escopo

- Em escopo:
  - Setup inicial de tRPC server no App Router.
  - Router inicial com procedure `metrics.homepage`.
  - Integração na homepage para métricas (`codes roasted` e `avg score`).
  - Renderização via Server Components com `Suspense` e skeleton de loading.
  - Animação dos números com NumberFlow após carregamento.
- Fora de escopo:
  - Setup de client tRPC + TanStack Query/hidratação SSR nesta fase.
  - Procedures `leaderboard.list` e `roast.byId` nesta fase.
  - Autenticação/autorização.
  - Realtime/subscriptions.
  - Migração das páginas `leaderboard` e `roast/[id]` nesta fase.
  - Migração completa de todas as Server Actions existentes.

## Abordagem

- Implementar fase 1 mínima com tRPC server-only:
  - `createCaller` para consumo direto em Server Components.
  - Route handler em `/api/trpc` para GET/POST.
- Encapsular query de métricas de homepage em procedure `metrics.homepage`.
- Na UI, usar `Suspense` + skeleton e NumberFlow em componente client para animação dos valores.

## Implementação

- Dependências:
  - adicionar: `@trpc/server`, `zod`, `server-only`, `@number-flow/react`.
- Estrutura base tRPC (novos arquivos):
  - `src/trpc/init.ts` (initTRPC, contexto, helpers de router/procedure)
  - `src/trpc/routers/_app.ts` (root router + export `AppRouter`)
  - `src/trpc/routers/metrics.ts` (procedure `metrics.homepage`)
  - `src/trpc/server.ts` (`getCaller` para Server Components)
  - `src/app/api/trpc/[trpc]/route.ts` (fetch adapter GET/POST)
- Query de dados:
  - `src/features/leaderboard/queries/get-home-metrics.ts` (`count` de roasts + `avg` de score)
- Arquivos alterados:
  - `src/app/page.tsx` (Suspense + fallback skeleton para métricas)
  - `src/features/roast/components/code-input-section.tsx` (slot para métricas)
  - `src/features/roast/components/home-metrics.tsx` (Server Component)
  - `src/features/roast/components/home-metrics-skeleton.tsx` (loading state)
  - `src/features/roast/components/animated-metric-number.tsx` (NumberFlow em client component)
- Contrato desta fase:
  - `metrics.homepage` (`input: void`, `output: { totalRoastedCodes: number; averageScore: number }`)

## Critérios de aceite

- `pnpm dev` sobe com rota tRPC funcional em `/api/trpc`.
- Homepage mostra métricas vindas de `metrics.homepage`.
- Bloco de métricas usa Server Component com `Suspense` e skeleton no loading.
- Números animam de `0` até o valor carregado usando NumberFlow.
- Tipagem fim-a-fim da procedure funciona sem tipos duplicados na página.
- `pnpm check` e `pnpm build` passam.

## Checklist

- [ ] Instalar dependências mínimas de tRPC server + NumberFlow.
- [ ] Criar base tRPC (`init`, `appRouter`, `metricsRouter`, route handler).
- [ ] Implementar query `get-home-metrics` e procedure `metrics.homepage`.
- [ ] Integrar métricas na homepage com Server Component + `Suspense` + skeleton.
- [ ] Animar números com NumberFlow em client component.
- [ ] Validar ausência de regressão visual na homepage.
- [ ] Validação final (`pnpm check` e `pnpm build`).
