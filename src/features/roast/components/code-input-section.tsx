"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { CodeEditor } from "./code-editor";

type CodeInputSectionProps = {
  metricsSlot?: ReactNode;
};

function CodeInputSection({ metricsSlot }: CodeInputSectionProps) {
  const [code, setCode] = useState("");
  const [roastMode, setRoastMode] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <CodeEditor
        value={code}
        onChange={setCode}
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
        <Button size="sm" disabled={!code.trim()}>
          $ roast_my_code
        </Button>
      </div>

      {/* Footer stats */}
      {metricsSlot}
    </div>
  );
}

export { CodeInputSection };
