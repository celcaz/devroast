# Spec: AI Roast com Vercel AI SDK

## Contexto

O DevRoast usa um LLM para analisar o código submetido e devolver um resultado estruturado: score, verdict, frase de roast, issues categorizados por severidade e um suggested fix em diff. Esta spec cobre a integração com o **Vercel AI SDK** (`ai`) de forma agnóstica ao provider — o modelo pode ser trocado sem alterar a lógica da aplicação.

---

## Por que Vercel AI SDK

- **Agnóstico ao provider:** a mesma API funciona com OpenAI, Anthropic, Google, Groq, Mistral, etc. Trocar o modelo é só mudar uma linha
- **`generateText` + `Output.object()`:** retorna dados estruturados validados por Zod, sem parsing manual
- **Next.js Server Actions:** integra nativamente com o App Router — sem necessidade de Route Handlers separados
- **Streaming opcional:** `streamText` com `Output.object()` permite streaming do objeto parcial para o cliente via `useObject`

---

## Output estruturado esperado

O LLM deve retornar um objeto único com todo o resultado do roast. O schema Zod serve tanto para validar a saída do modelo quanto para tipar o retorno da Server Action.

```ts
// src/features/roast/schemas/roast-output.ts
import { z } from "zod";

export const roastIssueSchema = z.object({
  severity: z.enum(["critical", "warning", "good"]),
  title: z.string().max(120).describe("Short title of the issue, max 8 words"),
  description: z
    .string()
    .describe("Detailed explanation of the issue or praise, 1-2 sentences"),
});

export const roastOutputSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(10)
    .describe("Code quality score from 0.0 (catastrophic) to 10.0 (excellent). Use one decimal place."),
  verdict: z
    .enum([
      "legendary_disaster",
      "needs_serious_help",
      "mediocre_at_best",
      "getting_there",
      "actually_decent",
    ])
    .describe("Overall verdict based on score: 0-2 = legendary_disaster, 2-4 = needs_serious_help, 4-6 = mediocre_at_best, 6-8 = getting_there, 8-10 = actually_decent"),
  roast_quote: z
    .string()
    .describe("A witty, brutal one-liner roast of the code. Max 120 chars. In quotes."),
  issues: z
    .array(roastIssueSchema)
    .min(2)
    .max(6)
    .describe("List of specific issues found. Mix of critical, warning and good items."),
  suggested_fix: z
    .string()
    .describe("The improved version of the code. Return ONLY the code, no explanation, no markdown fences."),
});

export type RoastOutput = z.infer<typeof roastOutputSchema>;
```

---

## Prompt do sistema

```ts
// src/features/roast/lib/roast-prompt.ts

export function buildRoastPrompt(code: string, language: string): string {
  return `You are DevRoast, a brutally honest code reviewer with sharp wit.

Analyze the following ${language} code and return a structured roast.

Rules:
- Be honest and specific — point to actual problems in the code
- The score should reflect real code quality (most submissions score between 1 and 6)
- The roast_quote must be funny and cutting, referencing the actual code flaws
- Issues should be specific to THIS code, not generic advice
- suggested_fix must be a complete, working improved version of the code

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;
}
```

---

## Server Action: `generateRoast`

```ts
// src/features/roast/actions/generate-roast.ts
"use server";

import { generateText, Output } from "ai";
import { roastOutputSchema, type RoastOutput } from "../schemas/roast-output";
import { buildRoastPrompt } from "../lib/roast-prompt";
import { getAIModel } from "@/lib/ai";

export async function generateRoast(
  code: string,
  language: string,
): Promise<RoastOutput> {
  const { output } = await generateText({
    model: getAIModel(),
    output: Output.object({
      name: "RoastResult",
      description: "Structured code roast result",
      schema: roastOutputSchema,
    }),
    prompt: buildRoastPrompt(code, language),
  });

  return output;
}
```

---

## Configuração do provider (`src/lib/ai.ts`)

A abstração do provider fica isolada em um único arquivo. Para trocar o modelo, basta alterar este arquivo — o resto da aplicação não muda.

```ts
// src/lib/ai.ts
import { createOpenAI } from "@ai-sdk/openai";
// import { createAnthropic } from "@ai-sdk/anthropic";
// import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Instância do provider — trocar aqui para mudar o LLM
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export function getAIModel() {
  return openai("gpt-4o-mini");
  // Alternativas:
  // return anthropic("claude-haiku-4-5");
  // return google("gemini-2.5-flash");
}
```

---

## Variáveis de ambiente

```bash
# .env.example — adicionar ao existente
OPENAI_API_KEY=""        # se usar OpenAI
ANTHROPIC_API_KEY=""     # se usar Anthropic
GOOGLE_API_KEY=""        # se usar Google
```

Apenas a variável do provider escolhido precisa ser preenchida. As outras podem ficar em branco.

---

## Estrutura de arquivos

```
src/
├── lib/
│   └── ai.ts                              ← configuração do provider (NOVO)
├── features/
│   └── roast/
│       ├── schemas/
│       │   └── roast-output.ts            ← Zod schema do output (NOVO)
│       ├── lib/
│       │   └── roast-prompt.ts            ← builder do prompt (NOVO)
│       └── actions/
│           ├── generate-roast.ts          ← Server Action de geração (NOVO)
│           └── submit-code.ts             ← já na spec do Drizzle
```

---

## Fluxo completo (submit → roast → persist)

```
[client] CodeInputSection
    │
    │  form submit (code, language)
    ▼
[server] submitCode()                   ← insere em submissions
    │
    │  submissionId
    ▼
[server] generateRoast(code, language)  ← chama o LLM via AI SDK
    │
    │  RoastOutput { score, verdict, issues, ... }
    ▼
[server] saveRoast(submissionId, output) ← insere em roasts + roast_issues
    │
    │  roastId
    ▼
[client] redirect("/roast/[roastId]")   ← página de resultados
```

A orquestração dessas 3 etapas deve acontecer em uma única Server Action (`roastCode`) que chama as três em sequência, com tratamento de erro:

```ts
// src/features/roast/actions/roast-code.ts
"use server";

export async function roastCode(code: string, language: string) {
  // 1. Persistir submissão
  const submission = await submitCode(code, language);

  // 2. Gerar roast via LLM
  const roastOutput = await generateRoast(code, language);

  // 3. Persistir resultado
  const roast = await saveRoast(submission.id, roastOutput);

  return { submissionId: submission.id, roastId: roast.id };
}
```

---

## Dependências a instalar

```bash
npm install ai zod
npm install @ai-sdk/openai   # ou @ai-sdk/anthropic / @ai-sdk/google
```

| Pacote | Versão | Uso |
|---|---|---|
| `ai` | `^5` | Vercel AI SDK core — `generateText`, `Output`, `streamText` |
| `zod` | `^3` | Validação do schema de output |
| `@ai-sdk/openai` | `^2` | Provider OpenAI (ou trocar por outro) |
| `@ai-sdk/anthropic` | `^2` | Provider Anthropic (alternativa) |
| `@ai-sdk/google` | `^2` | Provider Google (alternativa) |

Instale apenas o pacote do provider que for usar.

---

## Considerações sobre modelos

| Modelo | Custo | Qualidade do roast | Recomendado para |
|---|---|---|---|
| `gpt-4o-mini` | Baixo | Bom | Desenvolvimento e produção com volume alto |
| `gpt-4o` | Médio | Ótimo | Produção com qualidade máxima |
| `claude-haiku-4-5` | Baixo | Bom | Alternativa econômica à OpenAI |
| `claude-sonnet-4-5` | Médio | Ótimo | Melhor qualidade de análise de código |
| `gemini-2.5-flash` | Baixo | Bom | Alternativa com contexto grande |

O schema Zod garante que independente do modelo escolhido, o output será validado antes de chegar ao banco.

---

## Tratamento de erros

```ts
import { NoObjectGeneratedError } from "ai";

try {
  const output = await generateRoast(code, language);
} catch (error) {
  if (NoObjectGeneratedError.isInstance(error)) {
    // O modelo não conseguiu gerar um objeto válido
    // Possível fallback: tentar novamente com temperatura menor
    // ou retornar um roast padrão de erro
  }
  throw error;
}
```

---

## To-dos de implementação

### Setup do AI SDK
- [ ] Instalar `ai`, `zod` e o pacote do provider escolhido (ex: `@ai-sdk/openai`)
- [ ] Criar `src/lib/ai.ts` com `getAIModel()` isolando a configuração do provider
- [ ] Adicionar a variável da API key ao `.env.example` e ao `.env.local`

### Schema e prompt
- [ ] Criar `src/features/roast/schemas/roast-output.ts` com `roastOutputSchema` e `RoastOutput`
- [ ] Criar `src/features/roast/lib/roast-prompt.ts` com `buildRoastPrompt(code, language)`
- [ ] Ajustar o prompt para o tom correto do DevRoast (brutal, engraçado, específico)

### Server Actions
- [ ] Criar `src/features/roast/actions/generate-roast.ts` — chamada ao LLM
- [ ] Criar `src/features/roast/actions/roast-code.ts` — orquestrador (submit + generate + save)
- [ ] Adicionar tratamento de erro com `NoObjectGeneratedError`

### Integração com o formulário
- [ ] Conectar o botão `$ roast_my_code` em `CodeInputSection` à Server Action `roastCode`
- [ ] Adicionar estado de loading no botão durante a geração
- [ ] Redirecionar para `/roast/[roastId]` após sucesso

### Página de resultados
- [ ] Criar `src/app/roast/[id]/page.tsx` (Server Component)
  - Buscar `getRoastById(id)` no banco
  - Renderizar Score Hero, Submitted Code, Analysis Grid, Diff Section conforme o design (Screen 2)
