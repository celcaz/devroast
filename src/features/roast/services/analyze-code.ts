import {
  type RoastOutput,
  roastOutputSchema,
} from "@/features/roast/schemas/roast-output";

type AnalyzeCodeInput = {
  code: string;
  language: "javascript" | "typescript" | "python";
  roastMode: boolean;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
};

type AnalyzeCodeResult = RoastOutput & {
  modelUsed: string;
};

type OpenAiResponsesApi = {
  output: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  model?: string;
};

const DEFAULT_MODEL = "gpt-4.1-mini";
const OPENAI_URL = "https://api.openai.com/v1/responses";

function buildSystemPrompt(roastMode: boolean): string {
  if (roastMode) {
    return [
      "You are DevRoast, a sarcastic code reviewer.",
      "Be witty and sharp, but keep the technical assessment fair.",
      "Return ONLY valid JSON following the provided schema.",
      "Do not include markdown fences.",
    ].join(" ");
  }

  return [
    "You are DevRoast, a direct and objective code reviewer.",
    "Keep feedback blunt but not sarcastic.",
    "Return ONLY valid JSON following the provided schema.",
    "Do not include markdown fences.",
  ].join(" ");
}

function buildUserPrompt(
  code: string,
  language: AnalyzeCodeInput["language"],
): string {
  return [
    "Analyze the snippet and return JSON with fields:",
    "score (0-10), verdict (enum), roastQuote, issues[], suggestedFix.",
    "Keep technical rigor consistent regardless of tone.",
    `Language: ${language}`,
    "Code:",
    code,
  ].join("\n");
}

function readTextOutput(payload: OpenAiResponsesApi): string {
  const text = payload.output
    .flatMap((item) => item.content ?? [])
    .find((part) => part.type === "output_text" && part.text)?.text;

  if (!text) {
    throw new Error("OpenAI did not return output text");
  }

  return text;
}

async function analyzeCode({
  code,
  language,
  roastMode,
  fetchImpl = fetch,
  signal,
}: AnalyzeCodeInput): Promise<AnalyzeCodeResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  const response = await fetchImpl(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: buildSystemPrompt(roastMode),
        },
        {
          role: "user",
          content: buildUserPrompt(code, language),
        },
      ],
      text: {
        format: {
          type: "json_object",
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as OpenAiResponsesApi;
  const rawText = readTextOutput(payload);
  const parsed = JSON.parse(rawText);
  const output = roastOutputSchema.parse(parsed);

  return {
    ...output,
    modelUsed: payload.model ?? model,
  };
}

export type { AnalyzeCodeInput, AnalyzeCodeResult };
export { analyzeCode, DEFAULT_MODEL };
