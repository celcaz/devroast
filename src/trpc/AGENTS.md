# AGENTS.md — Padroes de tRPC

Este arquivo define convencoes para implementacao de tRPC em `src/trpc`.

## Escopo atual

- Implementacao em fase server-only.
- Consumidores em Server Components devem usar `getCaller` de `src/trpc/server.ts`.
- Nao introduzir client tRPC, provider React Query, hidratacao SSR ou hooks tRPC client nesta fase.

## Estrutura obrigatoria

- `init.ts` centraliza `initTRPC`, `createTRPCContext`, `router` e `publicProcedure`.
- `routers/_app.ts` agrega routers por dominio e exporta `AppRouter`.
- `routers/<dominio>.ts` define procedures por dominio e depende de queries de feature.
- Route handler HTTP fica em `src/app/api/trpc/[trpc]/route.ts` usando `fetchRequestHandler`.

## Convencoes de procedures

- Nomear procedure de forma orientada a tela/caso de uso (ex: `metrics.homepage`).
- Delegar acesso a dados para `src/features/<feature>/queries/*`.
- Evitar logica de normalizacao de tipos na procedure quando ela pertence a query de dados.
- Manter procedures sem efeitos colaterais quando forem apenas leitura.
