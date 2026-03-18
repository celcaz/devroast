"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  type DetectedLanguage,
  detectLanguage,
  getLanguageLabel,
  highlightCode,
  SUPPORTED_LANGUAGES,
} from "./language-detector";

async function computeHighlight(
  code: string,
  lang: string,
): Promise<{ html: string; detected: DetectedLanguage | null }> {
  if (!code) {
    return { html: "", detected: null };
  }

  if (lang === "auto") {
    const detected = await detectLanguage(code);
    const effectiveLang =
      detected.confidence >= 30 ? detected.lang : "plaintext";
    const html = await highlightCode(code, effectiveLang);
    return { html, detected };
  }

  const html = await highlightCode(code, lang);
  return { html, detected: null };
}

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  placeholder?: string;
  className?: string;
};

function CodeEditor({
  value,
  onChange,
  language = "auto",
  onLanguageChange,
  placeholder = "// paste your code here...",
  className,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [lineCount, setLineCount] = useState(1);
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const [detectedLang, setDetectedLang] = useState<DetectedLanguage | null>(
    null,
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [isHighlightReady, setIsHighlightReady] = useState(false);

  // Sync selectedLanguage when prop changes
  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  // Update line count
  useEffect(() => {
    const lines = value ? value.split("\n").length : 1;
    setLineCount(Math.max(lines, 1));
  }, [value]);

  // Apply highlight on initial render if value is already filled
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount
  useEffect(() => {
    if (!value) return;
    async function runOnMount() {
      const { html, detected } = await computeHighlight(
        value,
        selectedLanguage,
      );
      setHighlightedHtml(html);
      setDetectedLang(detected);
      setIsHighlightReady(true);
    }
    runOnMount();
  }, []);

  // Debounced highlight on value/language change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    setIsHighlightReady(false);

    debounceRef.current = setTimeout(async () => {
      const { html, detected } = await computeHighlight(
        value,
        selectedLanguage,
      );
      setHighlightedHtml(html);
      setDetectedLang(detected);
      setIsHighlightReady(true);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, selectedLanguage]);

  function handleScroll() {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }

  function handleLanguageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    onLanguageChange?.(lang);
  }

  const isAuto = selectedLanguage === "auto";
  const displayLang = isAuto
    ? detectedLang && detectedLang.confidence >= 30
      ? detectedLang.label
      : "Plain Text"
    : getLanguageLabel(selectedLanguage);

  return (
    <div
      className={cn(
        "overflow-hidden border border-border-primary bg-bg-input",
        className,
      )}
    >
      {/* Window header */}
      <div className="flex h-10 items-center justify-between border-b border-border-primary px-4">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-accent-red" />
          <span className="size-3 rounded-full bg-accent-amber" />
          <span className="size-3 rounded-full bg-accent-green" />
        </div>

        {/* Language selector */}
        <div className="relative flex cursor-pointer items-center gap-1.5">
          <span className="font-primary text-xs text-text-tertiary">
            {displayLang}
            {isAuto && <span className="ml-1 opacity-50">• auto</span>}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-tertiary"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            aria-label="Select language"
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            <option value="auto">Auto Detect</option>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {getLanguageLabel(lang)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex h-[360px]">
        {/* Line numbers */}
        <div
          aria-hidden="true"
          className="flex w-12 shrink-0 select-none flex-col items-end border-r border-border-primary bg-bg-surface px-3 py-4"
        >
          {Array.from({ length: lineCount }, (_, i) => {
            const lineNumber = i + 1;
            return (
              <span
                key={lineNumber}
                className="font-primary text-xs leading-5 text-text-tertiary"
              >
                {lineNumber}
              </span>
            );
          })}
        </div>

        {/* Editor area: highlight layer + textarea */}
        <div className="relative flex-1 overflow-hidden">
          {/* Highlight layer (aria-hidden, not interactive) */}
          <div
            ref={highlightRef}
            aria-hidden="true"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled hljs output
            dangerouslySetInnerHTML={{
              __html: highlightedHtml
                ? highlightedHtml
                : `<span class="placeholder-hint">${placeholder}</span>`,
            }}
            className={cn(
              "pointer-events-none absolute inset-0 select-none overflow-auto",
              "whitespace-pre p-4",
              "font-primary text-xs leading-5 text-text-primary",
            )}
          />

          {/* Real textarea — transparent text, visible caret */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            placeholder=""
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className={cn(
              "absolute inset-0 z-10 resize-none bg-transparent p-4 outline-none",
              "font-primary text-xs leading-5",
              "overflow-auto whitespace-pre",
              isHighlightReady ? "[color:transparent]" : "text-text-primary",
              "[caret-color:theme(colors.text-primary)]",
            )}
          />
        </div>
      </div>
    </div>
  );
}

export type { CodeEditorProps };
export { CodeEditor };
