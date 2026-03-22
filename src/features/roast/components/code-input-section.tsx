"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import type { CreateRoastActionInput } from "@/features/roast/actions/create-roast";
import { createRoastAction } from "@/features/roast/actions/create-roast";
import { CodeEditor } from "./code-editor";

type CodeInputSectionProps = {
  metricsSlot?: ReactNode;
};

function isSupportedLanguage(
  value: string,
): value is CreateRoastActionInput["language"] {
  return value === "javascript" || value === "typescript" || value === "python";
}

function CodeInputSection({ metricsSlot }: CodeInputSectionProps) {
  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const router = useRouter();

  function formatRetryAfter(seconds: number): string {
    const minutes = Math.ceil(seconds / 60);
    return `limite de roasts por hora atingido. tente novamente em ~${minutes} min`;
  }

  function handleSubmit() {
    if (language === "auto" || !isSupportedLanguage(language)) {
      setSubmitError(
        "linguagem ainda nao suportada na v1 (use javascript, typescript ou python)",
      );
      return;
    }

    setSubmitError(null);

    startTransition(async () => {
      const result = await createRoastAction({
        code,
        language,
        roastMode,
      });

      if (result.ok) {
        router.push(`/roast/${result.roastId}`);
        return;
      }

      if (
        result.error.code === "RATE_LIMIT" &&
        typeof result.error.retryAfterSeconds === "number"
      ) {
        setSubmitError(formatRetryAfter(result.error.retryAfterSeconds));
        return;
      }

      setSubmitError(result.error.message);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <CodeEditor
        value={code}
        onChange={setCode}
        language={language}
        onLanguageChange={setLanguage}
        placeholder={"// paste your code here..."}
      />

      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Toggle
            label="roast mode"
            checked={roastMode}
            onCheckedChange={setRoastMode}
          />
          <span className="font-secondary text-xs text-text-tertiary">
            {"// maximum sarcasm enabled"}
          </span>
        </div>
        <Button
          size="sm"
          disabled={isSubmitting || !code.trim()}
          onClick={handleSubmit}
        >
          {isSubmitting ? "$ roasting..." : "$ roast_my_code"}
        </Button>
      </div>

      {submitError ? (
        <p className="font-secondary text-xs text-accent-red">{submitError}</p>
      ) : null}

      {/* Footer stats */}
      {metricsSlot}
    </div>
  );
}

export { CodeInputSection };
