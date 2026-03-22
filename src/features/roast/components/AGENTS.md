# AGENTS.md — Padroes de componentes da feature roast

Este arquivo define convencoes para `src/features/roast/components`.

## Server e client boundaries

- Componentes de dados sem estado local devem permanecer Server Components (ex: `home-metrics.tsx`).
- Componentes que usam hooks (`useState`, `useEffect`) devem ser client com `"use client"` no topo.
- Para animacao numerica, encapsular `@number-flow/react` em componente client dedicado (ex: `animated-metric-number.tsx`).

## Integracao com homepage

- `CodeInputSection` deve continuar recebendo extensoes de UI por slot tipado com `ReactNode` (`metricsSlot`).
- Conteudo de metricas da home deve ser injetado via slot, evitando hardcode de valores no componente client.
- Caso exista loading assincrono de metricas server-side, preferir `Suspense` no ponto de composicao da pagina.

## Conteudo de metricas

- Formatar contadores com agrupamento de milhares quando aplicavel.
- Para valores decimais de score, manter 1 casa decimal na apresentacao.
- Texto de apoio deve refletir o contrato atual de dados (`totalRoastedCodes`, `averageScore`).
