# Spec: tRPC como camada de API com SSR (Next.js App Router)

## Contexto

Hoje o projeto usa queries/actions diretas no app. Queremos adotar tRPC como camada única de API/back-end, mantendo tipagem fim-a-fim e integração correta com SSR/RSC no Next.js.

## Escopo

- Em escopo:
  - Setup de tRPC server + client no App Router.
  - Integração com TanStack Query para hidratação SSR.
  - Router inicial com procedimentos para `leaderboard` e `roast by id`.
  - Migração das páginas SSR para consumir tRPC.
- Fora de escopo:
  - Autenticação/autorização.
  - Realtime/subscriptions.
  - Migração completa de todas as Server Actions existentes.

## Abordagem

- Usar padrão oficial tRPC v11 para RSC:
  - `createTRPCOptionsProxy` no servidor (prefetch em Server Components).
  - `HydrationBoundary` + `dehydrate` para cache SSR → client.
  - Provider client com `@trpc/tanstack-react-query`.
- Manter fonte de dados atual (Drizzle/queries existentes), encapsulando em procedures tRPC.
- Para dados necessários apenas no servidor, usar `caller` dedicado (sem depender do cache cliente).

## Implementação

- Dependências:
  - adicionar: `@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`, `@tanstack/react-query`, `zod`, `server-only`, `client-only`.
- Estrutura base (novos arquivos):
  - `src/trpc/init.ts` (initTRPC, contexto, helpers de router/procedure)
  - `src/trpc/routers/_app.ts` (root router + export `AppRouter`)
  - `src/trpc/routers/leaderboard.ts` (procedures de leaderboard)
  - `src/trpc/routers/roast.ts` (procedures de roast)
  - `src/trpc/query-client.ts` (factory do QueryClient, defaults SSR)
  - `src/trpc/client.tsx` (TRPCReactProvider + `useTRPC`)
  - `src/trpc/server.tsx` (`trpc`, `getQueryClient`, `HydrateClient`, `prefetch`, `caller`)
  - `src/app/api/trpc/[trpc]/route.ts` (fetch adapter GET/POST)
- Arquivos alterados:
  - `src/app/layout.tsx` (montar `TRPCReactProvider`)
  - `src/app/leaderboard/page.tsx` (prefetch tRPC SSR + hydrate)
  - `src/app/roast/[id]/page.tsx` (buscar por id via tRPC em SSR)
- Contratos iniciais:
  - `leaderboard.list` (`input: { limit?: number }`, output tipado para cards/tabela)
  - `roast.byId` (`input: { id: string }`, output tipado do roast completo)

## Critérios de aceite

- `pnpm dev` sobe com rota tRPC funcional em `/api/trpc`.
- Páginas `leaderboard` e `roast/[id]` usam tRPC no SSR sem quebrar layout.
- Dados prefetched no servidor são hidratados no client (sem refetch imediato indesejado).
- Tipagem fim-a-fim funcionando (input/output inferidos sem tipos duplicados nas páginas).
- `pnpm check` e `pnpm build` passam.

## Checklist

- [ ] Instalar dependências do tRPC + TanStack Query.
- [ ] Criar base tRPC (`init`, routers, route handler).
- [ ] Criar camada client/server (`client.tsx`, `server.tsx`, `query-client.ts`).
- [ ] Montar provider no `layout.tsx`.
- [ ] Implementar procedures `leaderboard.list` e `roast.byId` usando queries atuais.
- [ ] Migrar `src/app/leaderboard/page.tsx` para prefetch + hydrate via tRPC.
- [ ] Migrar `src/app/roast/[id]/page.tsx` para buscar por `id` via tRPC.
- [ ] Validar SSR/RSC (dehydrate/hydration) e ausência de regressão visual.
- [ ] Validação final (`pnpm check` e `pnpm build`).
