# Spec: Drizzle ORM + PostgreSQL

## Contexto

O DevRoast precisa persistir as submissões de código e seus respectivos resultados de análise (roasts). Atualmente todos os dados da homepage e do leaderboard são mockados. Esta spec cobre a estrutura do banco de dados, os enums, as tabelas e o setup completo com Drizzle ORM + PostgreSQL via Docker Compose.

### Fontes consultadas

- **Pencil (design):** 4 telas analisadas — Code Input, Roast Results, Shame Leaderboard, OG Image
- **Código:** `src/app/page.tsx`, `src/features/roast/`, `src/components/ui/`
- **Decisões do produto:** roasts anônimos (sem auth), roast_mode não persiste

---

## Entidades identificadas no design

A partir das telas do Pencil, foram identificadas as seguintes entidades e campos:

### Tela 1 — Code Input
- Código submetido pelo usuário
- Linguagem de programação (ex: `javascript`, `typescript`, `sql`)
- Toggle de "roast mode" (não persiste — apenas parâmetro de runtime)

### Tela 2 — Roast Results
- Score numérico (ex: `3.5`)
- Verdict textual (ex: `needs_serious_help`)
- Frase do roast (ex: `"this code looks like it was written during a power outage..."`)
- Metadados: linguagem, número de linhas
- Issue cards: severidade (`critical`, `warning`, `good`), título, descrição
- Suggested fix: diff com linhas removidas e adicionadas
- Botão de share (slug/id público)

### Tela 3 — Shame Leaderboard
- Rank (calculado por score ascendente)
- Score, linguagem, número de linhas
- Preview do código (primeiras linhas)
- Total de submissões e média de score (agregações)

### Tela 4 — OG Image
- Score, verdict, frase do roast, linguagem, linhas
- (Gerada a partir dos dados do roast — sem entidade própria)

---

## Enums

```ts
// src/db/schema.ts

export const languageEnum = pgEnum("language", [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "cpp",
  "c",
  "csharp",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "bash",
  "markdown",
  "plaintext",
]);

export const verdictEnum = pgEnum("verdict", [
  "legendary_disaster",   // score 0–2
  "needs_serious_help",   // score 2–4
  "mediocre_at_best",     // score 4–6
  "getting_there",        // score 6–8
  "actually_decent",      // score 8–10
]);

export const issueSeverityEnum = pgEnum("issue_severity", [
  "critical",
  "warning",
  "good",
]);
```

---

## Tabelas

### `submissions`

Armazena o código submetido pelo usuário e os metadados da submissão.

```ts
export const submissions = pgTable("submissions", {
  id:         uuid("id").primaryKey().defaultRandom(),
  code:       text("code").notNull(),
  language:   languageEnum("language").notNull(),
  line_count: integer("line_count").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
                .notNull()
                .defaultNow(),
});
```

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` PK | Identificador único da submissão |
| `code` | `text` | Código bruto submetido pelo usuário |
| `language` | `enum` | Linguagem detectada ou selecionada manualmente |
| `line_count` | `integer` | Número de linhas do código |
| `created_at` | `timestamp` | Data/hora da submissão |

---

### `roasts`

Armazena o resultado da análise para uma submissão. Relação 1:1 com `submissions`.

```ts
export const roasts = pgTable("roasts", {
  id:            uuid("id").primaryKey().defaultRandom(),
  submission_id: uuid("submission_id")
                   .notNull()
                   .unique()
                   .references(() => submissions.id, { onDelete: "cascade" }),
  score:         numeric("score", { precision: 3, scale: 1 }).notNull(), // ex: 3.5
  verdict:       verdictEnum("verdict").notNull(),
  roast_quote:   text("roast_quote").notNull(),
  suggested_fix: text("suggested_fix"), // diff em formato unificado (pode ser null se não houver sugestão)
  created_at:    timestamp("created_at", { withTimezone: true })
                   .notNull()
                   .defaultNow(),
});
```

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` PK | Identificador único do roast |
| `submission_id` | `uuid` FK → `submissions.id` | Relação com a submissão |
| `score` | `numeric(3,1)` | Score de 0.0 a 10.0 (ex: `3.5`) |
| `verdict` | `enum` | Classificação geral do código |
| `roast_quote` | `text` | Frase de roast gerada |
| `suggested_fix` | `text` nullable | Diff unificado com o código melhorado |
| `created_at` | `timestamp` | Data/hora da análise |

---

### `roast_issues`

Armazena os issue cards da análise detalhada. Relação N:1 com `roasts`.

```ts
export const roastIssues = pgTable("roast_issues", {
  id:          uuid("id").primaryKey().defaultRandom(),
  roast_id:    uuid("roast_id")
                 .notNull()
                 .references(() => roasts.id, { onDelete: "cascade" }),
  severity:    issueSeverityEnum("severity").notNull(),
  title:       varchar("title", { length: 120 }).notNull(),
  description: text("description").notNull(),
  order:       integer("order").notNull().default(0), // posição no grid de issues
});
```

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `uuid` PK | Identificador único do issue |
| `roast_id` | `uuid` FK → `roasts.id` | Relação com o roast pai |
| `severity` | `enum` | `critical`, `warning` ou `good` |
| `title` | `varchar(120)` | Título curto do issue (ex: "using var instead of const/let") |
| `description` | `text` | Descrição detalhada do problema |
| `order` | `integer` | Ordem de exibição no grid (0-indexed) |

---

## Relacionamentos

```
submissions (1) ──── (1) roasts (1) ──── (N) roast_issues
```

- Uma `submission` tem no máximo um `roast` (unique FK)
- Um `roast` tem múltiplos `roast_issues` (o design mostra um grid de 4 cards)
- Cascade delete: ao deletar uma `submission`, o `roast` e seus `roast_issues` são removidos automaticamente

---

## Estrutura de arquivos

```
src/
└── db/
    ├── index.ts        ← instância do cliente Drizzle + conexão
    ├── schema.ts       ← definição de todas as tabelas e enums
    └── migrations/     ← gerado automaticamente pelo drizzle-kit
        └── 0000_init.sql

drizzle.config.ts       ← configuração do drizzle-kit (raiz do projeto)
docker-compose.yml      ← PostgreSQL local
.env.local              ← DATABASE_URL (não commitar)
.env.example            ← template da variável de ambiente
```

---

## Docker Compose

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: devroast_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Variáveis de ambiente

```bash
# .env.example
DATABASE_URL="postgresql://devroast:devroast@localhost:5432/devroast"
```

---

## Configuração do Drizzle Kit

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## Scripts sugeridos no `package.json`

```json
"db:generate": "drizzle-kit generate",
"db:migrate":  "drizzle-kit migrate",
"db:studio":   "drizzle-kit studio",
"db:push":     "drizzle-kit push"
```

---

## Dependências a instalar

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
```

| Pacote | Versão recomendada | Uso |
|---|---|---|
| `drizzle-orm` | `^0.44` | ORM principal |
| `pg` | `^8` | Driver PostgreSQL para Node.js |
| `drizzle-kit` | `^0.31` | CLI para migrations e studio |
| `@types/pg` | `^8` | Tipos TypeScript para pg |

---

## To-dos de implementação

### Setup inicial
- [ ] Criar `docker-compose.yml` na raiz do projeto
- [ ] Criar `.env.example` com `DATABASE_URL`
- [ ] Adicionar `.env.local` ao `.gitignore`
- [ ] Instalar `drizzle-orm`, `pg`, `drizzle-kit`, `@types/pg`
- [ ] Criar `drizzle.config.ts` na raiz

### Schema
- [ ] Criar `src/db/schema.ts` com os enums (`languageEnum`, `verdictEnum`, `issueSeverityEnum`)
- [ ] Implementar tabela `submissions`
- [ ] Implementar tabela `roasts`
- [ ] Implementar tabela `roast_issues`
- [ ] Criar `src/db/index.ts` com a instância do cliente Drizzle

### Migrations
- [ ] Rodar `npm run db:generate` para gerar a migration inicial
- [ ] Rodar `npm run db:migrate` (com o Docker rodando) para aplicar no banco
- [ ] Verificar no `db:studio` se as tabelas foram criadas corretamente

### Integração com a aplicação
- [ ] Criar Server Action `submitCode` em `src/features/roast/actions/submit-code.ts`
  - Recebe: `code`, `language`
  - Insere em `submissions`
  - Retorna o `submission.id`
- [ ] Criar Server Action `saveRoast` em `src/features/roast/actions/save-roast.ts`
  - Recebe: `submissionId`, `score`, `verdict`, `roastQuote`, `suggestedFix`, `issues[]`
  - Insere em `roasts` e `roast_issues` em transação
- [ ] Criar query `getLeaderboard` em `src/features/leaderboard/queries/get-leaderboard.ts`
  - Join `submissions` + `roasts`
  - Ordena por `score ASC` (pior score = mais vergonhoso)
  - Retorna os campos necessários para o `TableRow` e os cards do leaderboard
- [ ] Criar query `getRoastBySubmissionId` para a página de resultados
- [ ] Substituir dados mockados em `src/app/page.tsx` (leaderboard preview) pelos dados reais

### Leaderboard page
- [ ] Criar `src/app/leaderboard/page.tsx` (Server Component)
  - Usar `getLeaderboard()` para buscar as entradas
  - Renderizar os `Entry` cards conforme o design (Screen 3)
