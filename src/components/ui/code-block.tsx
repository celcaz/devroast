import { cacheLife } from "next/cache";
import { codeToHtml } from "shiki";

type CodeBlockProps = {
  code: string;
  language?: string;
};

async function CodeBlock({ code, language = "javascript" }: CodeBlockProps) {
  "use cache";
  cacheLife("hours");

  const normalizedLanguage = language.toLowerCase();

  const html = await codeToHtml(code, {
    lang: normalizedLanguage,
    theme: "vesper",
  }).catch(async () => {
    return codeToHtml(code, {
      lang: "plaintext",
      theme: "vesper",
    });
  });

  const lines = code.split("\n");

  return (
    <div className="w-full overflow-hidden bg-bg-input font-primary">
      <div className="flex">
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
