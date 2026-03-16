import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { cn } from "@/lib/utils";

type CodeBlockProps = {
  code: string;
  lang?: BundledLanguage;
  filename?: string;
  className?: string;
};

async function CodeBlock({
  code,
  lang = "javascript",
  filename,
  className,
}: CodeBlockProps) {
  const html = await codeToHtml(code, {
    lang,
    theme: "vesper",
  });

  const lines = code.split("\n");

  return (
    <div
      className={cn(
        "w-full overflow-hidden border border-border-primary bg-bg-input font-primary",
        className,
      )}
    >
      {/* Header with traffic dots + filename */}
      <div className="flex h-10 items-center gap-3 border-b border-border-primary px-4">
        <div className="flex items-center gap-3">
          <span className="size-2.5 rounded-full bg-accent-red" />
          <span className="size-2.5 rounded-full bg-accent-amber" />
          <span className="size-2.5 rounded-full bg-accent-green" />
        </div>
        <div className="flex-1" />
        {filename && (
          <span className="text-xs text-text-tertiary">{filename}</span>
        )}
      </div>

      {/* Code body */}
      <div className="flex">
        {/* Line numbers */}
        <div className="flex flex-col gap-1.5 border-r border-border-primary bg-bg-surface px-2.5 py-3">
          {lines.map((_, i) => (
            <span
              key={`ln-${i.toString()}`}
              className="text-right text-[13px] leading-none text-text-tertiary"
            >
              {i + 1}
            </span>
          ))}
        </div>

        {/* Highlighted code — Shiki generates trusted HTML from user-provided code */}
        <div
          className="flex-1 overflow-x-auto p-3 text-[13px] leading-[22px] [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki codeToHtml output is trusted
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

export type { CodeBlockProps };
export { CodeBlock };
