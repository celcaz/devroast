"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
};

function CodeEditor({
  value,
  onChange,
  language,
  placeholder = "// paste your code here...",
  className,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = value ? value.split("\n").length : 1;
    setLineCount(Math.max(lines, 1));
  }, [value]);

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
        {language && (
          <span className="font-primary text-xs text-text-tertiary">
            {language}
          </span>
        )}
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

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="flex-1 resize-none bg-transparent p-4 font-primary text-xs leading-5 text-text-primary outline-none placeholder:text-text-tertiary"
        />
      </div>
    </div>
  );
}

export type { CodeEditorProps };
export { CodeEditor };
