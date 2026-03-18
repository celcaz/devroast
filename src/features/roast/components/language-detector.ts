const SUPPORTED_LANGUAGES = [
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
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export type DetectedLanguage = {
  lang: string;
  label: string;
  confidence: number;
};

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  rust: "Rust",
  go: "Go",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  php: "PHP",
  ruby: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  yaml: "YAML",
  bash: "Bash",
  markdown: "Markdown",
  plaintext: "Plain Text",
};

export function getLanguageLabel(lang: string): string {
  return LANGUAGE_LABELS[lang] ?? lang;
}

export { SUPPORTED_LANGUAGES };

let hljs: typeof import("highlight.js").default | null = null;

async function getHljs() {
  if (hljs) return hljs;

  const hljsCore = await import("highlight.js/lib/core");
  const instance = hljsCore.default;

  const [
    javascript,
    typescript,
    python,
    rust,
    go,
    java,
    cpp,
    c,
    csharp,
    php,
    ruby,
    swift,
    kotlin,
    sql,
    html,
    css,
    json,
    yaml,
    bash,
    markdown,
  ] = await Promise.all([
    import("highlight.js/lib/languages/javascript"),
    import("highlight.js/lib/languages/typescript"),
    import("highlight.js/lib/languages/python"),
    import("highlight.js/lib/languages/rust"),
    import("highlight.js/lib/languages/go"),
    import("highlight.js/lib/languages/java"),
    import("highlight.js/lib/languages/cpp"),
    import("highlight.js/lib/languages/c"),
    import("highlight.js/lib/languages/csharp"),
    import("highlight.js/lib/languages/php"),
    import("highlight.js/lib/languages/ruby"),
    import("highlight.js/lib/languages/swift"),
    import("highlight.js/lib/languages/kotlin"),
    import("highlight.js/lib/languages/sql"),
    import("highlight.js/lib/languages/xml"), // html
    import("highlight.js/lib/languages/css"),
    import("highlight.js/lib/languages/json"),
    import("highlight.js/lib/languages/yaml"),
    import("highlight.js/lib/languages/bash"),
    import("highlight.js/lib/languages/markdown"),
  ]);

  instance.registerLanguage("javascript", javascript.default);
  instance.registerLanguage("typescript", typescript.default);
  instance.registerLanguage("python", python.default);
  instance.registerLanguage("rust", rust.default);
  instance.registerLanguage("go", go.default);
  instance.registerLanguage("java", java.default);
  instance.registerLanguage("cpp", cpp.default);
  instance.registerLanguage("c", c.default);
  instance.registerLanguage("csharp", csharp.default);
  instance.registerLanguage("php", php.default);
  instance.registerLanguage("ruby", ruby.default);
  instance.registerLanguage("swift", swift.default);
  instance.registerLanguage("kotlin", kotlin.default);
  instance.registerLanguage("sql", sql.default);
  instance.registerLanguage("html", html.default);
  instance.registerLanguage("css", css.default);
  instance.registerLanguage("json", json.default);
  instance.registerLanguage("yaml", yaml.default);
  instance.registerLanguage("bash", bash.default);
  instance.registerLanguage("markdown", markdown.default);

  hljs = instance;
  return instance;
}

export async function detectLanguage(code: string): Promise<DetectedLanguage> {
  if (code.trim().length < 20) {
    return { lang: "plaintext", label: "Plain Text", confidence: 0 };
  }

  const instance = await getHljs();
  const result = instance.highlightAuto(code, [...SUPPORTED_LANGUAGES]);

  const lang = result.language ?? "plaintext";
  const confidence = Math.round((result.relevance / 20) * 100);

  return {
    lang,
    label: getLanguageLabel(lang),
    confidence: Math.min(confidence, 100),
  };
}

export async function highlightCode(
  code: string,
  lang: string,
): Promise<string> {
  if (!code) return "";

  const instance = await getHljs();

  if (lang === "auto" || lang === "plaintext" || !lang) {
    return instance.highlightAuto(code, [...SUPPORTED_LANGUAGES]).value;
  }

  try {
    return instance.highlight(code, { language: lang }).value;
  } catch {
    return instance.highlightAuto(code, [...SUPPORTED_LANGUAGES]).value;
  }
}
