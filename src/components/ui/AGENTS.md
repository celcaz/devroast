# agents.md — Padrao de criacao de componentes UI

## Estrutura de arquivos

- Cada componente vive em `src/components/ui/<nome>.tsx`
- Um componente por arquivo
- Nome do arquivo em kebab-case: `button.tsx`, `input.tsx`, `card.tsx`
- Componentes de **feature** (vinculados a uma funcionalidade especifica do produto) vivem em `src/features/<feature>/components/<nome>.tsx`

## Exports

- Sempre usar **named exports**, nunca `export default`
- Exportar o componente, as variants (quando existirem) e o type de props
- Em familias de composicao, exportar todos os sub-componentes e seus types
- Ordem: `export type` primeiro, depois `export {}`

```tsx
// primitivo simples
export type { ButtonProps };
export { Button, buttonVariants };

// familia de composicao
export type { TableProps, TableHeaderProps, TableRowProps };
export { Table, TableHeader, TableRow };
```

## Props e TypeScript

- Estender as propriedades nativas do elemento HTML correspondente usando `ComponentProps<"elemento">` do React
- Compor com `VariantProps<typeof variants>` quando houver variants
- Definir o tipo como `type`, nao `interface`
- Aceitar `className` como prop para permitir customizacao externa via `cn()`

```tsx
import type { ComponentProps } from "react";
import { type VariantProps } from "class-variance-authority";

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;
```

## Estilizacao

- Usar **Tailwind CSS** para todas as classes
- Usar `cn()` de `@/lib/utils` para merge de classes (tailwind-merge + clsx)
- Usar `cva()` do `class-variance-authority` para variants
- Nunca usar inline styles
- Usar tokens do design system (`globals.css`) em vez de cores hardcoded do Tailwind
  - `bg-accent-green` em vez de `bg-emerald-500`
  - `text-foreground` em vez de `text-white`
  - `border-border-primary` em vez de `border-neutral-700`
- Ao referenciar variaveis CSS em SVG ou `style` attr, usar o nome completo gerado pelo Tailwind v4: `var(--color-accent-green)`, nao `var(--accent-green)`

## Variants com CVA

- Definir `variants` e `defaultVariants` sempre
- Exportar a const de variants junto com o componente (ex: `buttonVariants`)
- Base classes no primeiro argumento do `cva()` devem incluir:
  - Layout (display, flex, align, gap)
  - Transicoes (`transition-colors`)
  - Estados de acessibilidade (`focus-visible`, `disabled`)
  - Font family do design system (`font-primary`)

```tsx
const buttonVariants = cva("classes-base...", {
  variants: {
    variant: { primary: "...", secondary: "..." },
    size: { sm: "...", md: "...", lg: "..." },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
```

## Padrao de Composicao

Prefira composicao a props quando o componente tiver **pedacos internos distintos** (titulo, descricao, colunas, celulas, etc.).

### Quando usar composicao

- O componente tem 2 ou mais sub-partes com estilos independentes
- O consumidor precisa de flexibilidade para reordenar, omitir ou customizar partes
- Exemplos: `Card` + `CardTitle` + `CardDescription`, `Table` + `TableHeader` + `TableRow`

### Quando usar props simples

- O componente e atomico e nao tem sub-partes (ex: `Badge`, `Button`, `DiffLine`)
- A estrutura interna e fixa e nao precisa ser customizada pelo consumidor

### Dot-notation para familias

Use dot-notation para agrupar sub-componentes relacionados no mesmo arquivo:

```tsx
// sub-componentes declarados como funcoes separadas
function TableRowRank({ className, ...props }: TableRowRankProps) { ... }
function TableRowScore({ className, ...props }: TableRowScoreProps) { ... }

// anexados ao componente raiz
TableRow.Rank = TableRowRank;
TableRow.Score = TableRowScore;

// uso
<TableRow>
  <TableRow.Rank>1</TableRow.Rank>
  <TableRow.Score className="text-accent-red">1.2</TableRow.Score>
</TableRow>
```

### Referencia — familia Table

```tsx
// table-row.tsx
function Table({ className, ...props }: TableProps) { ... }

function TableHeader({ className, ...props }: TableHeaderProps) { ... }
function TableHeaderCell({ className, ...props }: TableHeaderCellProps) { ... }
TableHeader.Cell = TableHeaderCell;

function TableRow({ className, ...props }: TableRowProps) { ... }
function TableRowRank({ className, ...props }: TableRowRankProps) { ... }
function TableRowScore({ className, ...props }: TableRowScoreProps) { ... }
function TableRowCode({ className, ...props }: TableRowCodeProps) { ... }
function TableRowLanguage({ className, ...props }: TableRowLanguageProps) { ... }
TableRow.Rank = TableRowRank;
TableRow.Score = TableRowScore;
TableRow.Code = TableRowCode;
TableRow.Language = TableRowLanguage;
```

## Componente

- Usar `function` declaration, nao arrow function
- Desestruturar `className`, variants e `...props` (rest)
- Aplicar `cn(variants({ variant, size, className }))` no elemento raiz
- Usar spread `{...props}` no elemento HTML nativo

```tsx
function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

## Server vs Client Components

- Componentes UI sao **Server Components** por padrao (sem `"use client"`)
- Adicionar `"use client"` apenas quando o componente precisar de hooks (`useState`, `useEffect`, `useRef`, etc.) ou event handlers internos
- Quem define `"use client"` e o consumidor que usa interatividade, nao o componente generico
- Componentes de feature que gerenciam estado ficam em `src/features/<feature>/components/` e podem ser `"use client"` livremente
- Manter `page.tsx` como Server Component: criar um wrapper client intermediario quando necessario

## Imports — ordem

Biome organiza automaticamente, mas a convencao e:

1. Libs externas (`class-variance-authority`, `react`)
2. Libs internas (`@/lib/utils`)

## Checklist para novos componentes

- [ ] Arquivo no lugar certo: `src/components/ui/` (primitivo) ou `src/features/<feature>/components/` (feature)
- [ ] Named exports (componente + variants + types)
- [ ] Props estendem `ComponentProps<"elemento-html">`
- [ ] Variants com `cva()` e `defaultVariants` (quando aplicavel)
- [ ] Estilos usam tokens do design system
- [ ] `cn()` para merge de classes
- [ ] `className` aceito como prop
- [ ] Spread `{...props}` no elemento nativo
- [ ] Sem `export default`
- [ ] Sem `"use client"` (a menos que necessario)
- [ ] Composicao via dot-notation quando o componente tiver sub-partes distintas
- [ ] Biome check passa sem erros

## Referencia — Componente completo (primitivo com CVA)

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium font-primary cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-green text-bg-page hover:bg-accent-green/80 focus-visible:ring-accent-green",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary",
        outline:
          "border border-border-primary bg-transparent text-foreground hover:bg-bg-elevated focus-visible:ring-border-focus",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-bg-elevated hover:text-foreground",
        destructive:
          "bg-destructive text-bg-page hover:bg-destructive/80 focus-visible:ring-destructive",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export type { ButtonProps };
export { Button, buttonVariants };
```
