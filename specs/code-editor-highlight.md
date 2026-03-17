# Spec: Code Editor com Syntax Highlight

## Contexto

O editor atual (`src/features/roast/components/code-editor.tsx`) é um `<textarea>` simples com numeração de linhas. O objetivo desta feature é substituí-lo por um editor que aplique syntax highlight em tempo real conforme o usuário digita ou cola código, detectando a linguagem automaticamente — mas também permitindo seleção manual.

---

## Referência: como o ray.so faz

O ray.so (Raycast) é o editor de código mais próximo do que queremos. A análise do repositório público e da UX mostra:

- Usa **CodeMirror 6** como base do editor — não é um textarea simples
- O highlight é aplicado diretamente nas tokens do editor, não em uma camada separada
- A detecção de linguagem é feita por **heurística**: quando o usuário cola código, analisa padrões sintáticos para inferir a linguagem
- Exibe um **seletor de linguagem** no header da janela (ao lado do filename)
- A troca de linguagem re-processa o highlight imediatamente sem recarregar nada
- O tema visual é fixo (escuro, cores VSCode-like) — igual ao nosso design

A principal diferença do ray.so para abordagens simples: o highlight é **ao vivo, inline no próprio campo editável** — não é um `<pre>` sobreposto por cima de um `<textarea>`.

---

## Pesquisa de Bibliotecas

### 1. CodeMirror 6

**Site:** codemirror.net

| Critério | Avaliação |
|---|---|
| Highlight ao vivo | ✅ Nativo — é a base do editor |
| Detecção automática | ❌ Não tem nativamente (precisa de lib externa) |
| Seleção manual de linguagem | ✅ Troca de `LanguageSupport` em runtime |
| Bundle size | ~150KB (core + 1 linguagem) |
| React support | Comunidade: `@uiw/react-codemirror` |
| Maturidade | ✅ Usado por Replit, Sourcegraph, CodePen |
| Customização de tema | ✅ API própria de temas |

**Como funciona:** o editor parseia o código com gramáticas Lezer (parser incremental, tolerante a erros) e aplica os tokens de highlight diretamente nas spans do editor. Não há separação entre "campo de input" e "layer de highlight".

**Prós:** solução mais completa, igual ao ray.so. Highlight nativo, performático, extensível.  
**Contras:** bundle pesado, curva de aprendizado alta, setup complexo no Next.js com `"use client"`.

---

### 2. Shiki (client-side)

**Site:** shiki.style

| Critério | Avaliação |
|---|---|
| Highlight ao vivo | ⚠️ Possível mas não é o uso primário — é server-side |
| Detecção automática | ❌ Não tem — requer linguagem explícita |
| Seleção manual de linguagem | ✅ Troca a `lang` e re-processa |
| Bundle size | ~200KB+ (WASM + gramáticas) |
| React support | Manual via `codeToHtml` / `codeToHast` |
| Maturidade | ✅ Muito maduro, usado no Next.js internamente |
| Customização de tema | ✅ Temas VS Code completos |

**Como funciona no client:** chama `codeToHtml(code, { lang, theme })` a cada mudança no `<textarea>`, e renderiza o HTML resultante em uma `<div>` sobreposta visualmente ao textarea (técnica do "textarea invisível + highlight layer").

**Já temos no projeto** para o `CodeBlock` server-side.

**Prós:** já instalado, familiar, output idêntico ao VS Code, temas riquíssimos.  
**Contras:** WASM no cliente é pesado (~1MB), `codeToHtml` é async, não foi projetado para uso interativo com digitação rápida, sem detecção automática nativa.

---

### 3. Highlight.js

**Site:** highlightjs.org

| Critério | Avaliação |
|---|---|
| Highlight ao vivo | ✅ Síncrono, funciona em client |
| Detecção automática | ✅ `highlightAuto()` nativa — ponto forte |
| Seleção manual de linguagem | ✅ `highlight(code, { language })` |
| Bundle size | ~50KB (core) + linguagens individuais |
| React support | Manual — renderiza HTML em `dangerouslySetInnerHTML` |
| Maturidade | ✅ Biblioteca mais antiga e testada do ecossistema |
| Customização de tema | ✅ 500+ temas CSS prontos |

**Como funciona:** processa o código e retorna HTML com classes CSS. Aplicado sobre o padrão "textarea + layer sobreposta". A função `highlightAuto` testa o código contra múltiplas gramáticas e retorna a linguagem com maior score de relevância.

**Prós:** detecção automática robusta e simples de usar, leve, síncrono (sem WASM), fácil de integrar.  
**Contras:** highlight menos preciso que CodeMirror/Shiki (não usa TextMate grammars), temas com classes CSS (não inline styles), requer sincronização de scroll entre textarea e layer.

---

### 4. Monaco Editor (VS Code engine)

| Critério | Avaliação |
|---|---|
| Highlight ao vivo | ✅ Nativo |
| Detecção automática | ❌ Não tem |
| Bundle size | ~2MB+ |
| React support | `@monaco-editor/react` |

**Descartado:** bundle gigante, overkill para o caso de uso, difícil de estilizar, não funciona em SSR.

---

## Abordagem Técnica Recomendada: Textarea + Highlight Layer

A técnica usada por ray.so, Carbon (carbon.now.sh) e outros editores visuais consiste em:

```
┌─────────────────────────────────────┐
│  Container (position: relative)      │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  <div> com HTML do highlight   │  │  ← layer visual (pointer-events: none)
│  │  (aria-hidden, não editável)   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  <textarea>                    │  │  ← input real (cor transparente)
│  │  (color: transparent,          │  │
│  │   caret visível, z-index alto) │  │
│  └────────────────────────────────┘  │
│                                      │
└─────────────────────────────────────┘
```

- O `<textarea>` recebe o input do usuário mas tem texto transparente
- A `<div>` de highlight renderiza o HTML colorido exatamente na mesma posição
- Ambos têm o mesmo `font-family`, `font-size`, `line-height`, `padding` — para que o texto se sobreponha pixel-a-pixel
- O scroll do textarea é sincronizado com o scroll da div

Esta técnica é leve, acessível e não requer instalar um editor completo.

---

## Decisão Final

### Biblioteca escolhida: **Highlight.js** para detecção + highlight

**Justificativa:**

1. **Detecção automática** (`highlightAuto`) é o requisito mais crítico — só hljs tem isso de forma robusta e simples
2. **Já é síncrono** — sem WASM, sem async, sem delay visível ao digitar
3. **Bundle leve** (~50KB core + linguagens sob demanda)
4. **Simples de integrar** com a técnica textarea+layer
5. Shiki já está no projeto para o `CodeBlock` server-side — não faz sentido carregar WASM no cliente para edição interativa
6. CodeMirror seria a escolha ideal se fôssemos construir um editor completo (autocomplete, indentação inteligente, etc.), mas para o escopo atual (colar código + highlight visual) é overkill

**Para o tema visual:** os tokens do hljs serão mapeados para as variáveis CSS do design system (`--color-syn-keyword`, `--color-syn-function`, etc.) em vez de usar um tema CSS externo.

---

## Especificação da Feature

### Componentes afetados

```
src/features/roast/components/
├── code-editor.tsx          ← refatorar (adicionar highlight layer)
├── code-input-section.tsx   ← adicionar seletor de linguagem
└── language-detector.ts     ← novo: lógica de detecção isolada
```

---

### `language-detector.ts` (novo)

Módulo utilitário client-side responsável por:

```ts
// Detecta a linguagem com base no código
detectLanguage(code: string): DetectedLanguage

type DetectedLanguage = {
  lang: string        // ex: "javascript"
  label: string       // ex: "JavaScript"  
  confidence: number  // 0–100, score de relevância do hljs
}
```

**Lógica:**
1. Se o código tiver menos de 20 caracteres, retorna `{ lang: "plaintext", confidence: 0 }`
2. Chama `hljs.highlightAuto(code, SUPPORTED_LANGUAGES)` com um subset restrito de linguagens (evita falsos positivos)
3. Retorna a linguagem detectada com score de confiança

**Subset de linguagens suportadas (SUPPORTED_LANGUAGES):**

```ts
const SUPPORTED_LANGUAGES = [
  "javascript", "typescript", "python", "rust",
  "go", "java", "cpp", "c", "csharp",
  "php", "ruby", "swift", "kotlin",
  "sql", "html", "css", "json", "yaml",
  "bash", "markdown"
]
```

---

### `code-editor.tsx` (refatorado)

**Props (sem mudança na API pública):**

```ts
type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  language?: string        // "auto" | nome da linguagem (ex: "javascript")
  placeholder?: string
  className?: string
}
```

**Comportamento:**
- Quando `language === "auto"` (padrão) ou não passado: usa a linguagem detectada internamente
- Quando `language` é um nome explícito: usa essa linguagem para o highlight
- O highlight é recalculado com `debounce` de **300ms** após cada `onChange` para não travar a digitação
- Na primeira renderização com `value` preenchido, o highlight é aplicado imediatamente
- A numeração de linhas permanece igual à implementação atual

**Estrutura interna:**

```tsx
<div className="relative"> {/* container */}
  {/* layer de highlight (aria-hidden) */}
  <div
    aria-hidden="true"
    className="... pointer-events-none select-none"
    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
  />

  {/* textarea real (texto transparente, caret visível) */}
  <textarea
    value={value}
    onChange={...}
    className="... absolute inset-0 text-transparent caret-text-primary"
    spellCheck={false}
  />
</div>
```

**Estado interno:**
```ts
const [highlightedHtml, setHighlightedHtml] = useState("")
const [detectedLang, setDetectedLang] = useState<DetectedLanguage | null>(null)
```

---

### `code-input-section.tsx` (atualizado)

**Novas responsabilidades:**
- Exibe a linguagem detectada no header do editor (badge ao lado dos window dots)
- Renderiza um `<select>` ou dropdown de linguagem para seleção manual
- Passa `language` para o `CodeEditor`

**UI do seletor de linguagem:**

```
┌─ window header ────────────────────────────────────────────┐
│  ● ● ●    [javascript ▾]                                   │
└────────────────────────────────────────────────────────────┘
```

- Quando em modo automático: mostra a linguagem detectada + indicador "auto" (ex: `javascript • auto`)
- Quando o usuário seleciona manualmente: remove o indicador "auto", exibe apenas o nome
- Se confiança de detecção < 30%: mostra `plaintext`

---

### Mapeamento de tokens hljs → design system

Em vez de importar um tema CSS externo do hljs, os tokens serão mapeados para as variáveis do projeto:

| Classe hljs | Variável CSS | Cor |
|---|---|---|
| `.hljs-keyword` | `--color-syn-keyword` | `#a0a0a0` |
| `.hljs-title`, `.hljs-function` | `--color-syn-function` | `#ffc799` |
| `.hljs-string`, `.hljs-attr` | `--color-syn-string` | `#99ffe4` |
| `.hljs-variable`, `.hljs-name` | `--color-syn-variable` | `#ffffff` |
| `.hljs-number`, `.hljs-literal` | `--color-syn-number` | `#ffc799` |
| `.hljs-type`, `.hljs-class` | `--color-syn-type` | `#ffc799` |
| `.hljs-comment` | `--color-text-tertiary` | `#4b5563` |
| `.hljs-property` | `--color-syn-property` | `#a0a0a0` |
| `.hljs-operator`, `.hljs-punctuation` | `--color-text-secondary` | `#6b7280` |

O CSS será adicionado em `globals.css` como regras globais `.hljs-*`.

---

### Considerações de performance

- **Debounce de 300ms** no recálculo do highlight para evitar lag ao digitar rápido
- **Carregar hljs lazy**: `import('highlight.js/lib/core')` + linguagens sob demanda para não inflar o bundle inicial
- **Memoizar** o resultado do highlight quando `value` e `language` não mudarem
- O `detectLanguage` só roda quando `language === "auto"` — não roda em toda mudança quando a linguagem está fixada manualmente

---

### O que NÃO está no escopo desta feature

- Autocompletion / IntelliSense
- Indentação inteligente
- Bracket matching visual
- Diff view
- Múltiplos cursores
- Temas alternativos (o tema é fixo: dark, cores do design system)
