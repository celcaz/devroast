"use server";

import { headers } from "next/headers";
import type { languageEnum } from "@/db/schema";
import { createRoastInputSchema } from "@/features/roast/schemas/create-roast-input";
import { analyzeCode } from "@/features/roast/services/analyze-code";
import { evaluateRateLimitWindow } from "@/features/roast/services/rate-limit";
import { pickClientIp } from "@/features/roast/utils/client-ip";
import { validateCodeLimits } from "@/features/roast/utils/code-limits";

type CreateRoastActionInput = {
  code: string;
  language: "javascript" | "typescript" | "python";
  roastMode: boolean;
};

type CreateRoastActionError = {
  code: "VALIDATION_ERROR" | "RATE_LIMIT" | "AI_ERROR";
  message: string;
  retryAfterSeconds?: number;
};

type CreateRoastActionResult =
  | {
      ok: true;
      roastId: string;
    }
  | {
      ok: false;
      error: CreateRoastActionError;
    };

type CreateRoastActionDeps = {
  evaluateRateLimitWindowImpl?: typeof evaluateRateLimitWindow;
  analyzeCodeImpl?: typeof analyzeCode;
  submitCodeImpl?: (input: {
    code: string;
    language: (typeof languageEnum.enumValues)[number];
  }) => Promise<{ id: string }>;
  saveRoastImpl?: (input: {
    submissionId: string;
    output: Awaited<ReturnType<typeof analyzeCode>>;
    modelUsed?: string;
  }) => Promise<{ id: string }>;
  headersImpl?: typeof headers;
  now?: () => Date;
  logError?: (event: string, payload: Record<string, unknown>) => void;
};

function buildValidationError(message: string): CreateRoastActionResult {
  return {
    ok: false,
    error: {
      code: "VALIDATION_ERROR",
      message,
    },
  };
}

async function createRoastAction(
  input: CreateRoastActionInput,
  deps: CreateRoastActionDeps = {},
): Promise<CreateRoastActionResult> {
  const evaluateRateLimitWindowImpl =
    deps.evaluateRateLimitWindowImpl ?? evaluateRateLimitWindow;
  const analyzeCodeImpl = deps.analyzeCodeImpl ?? analyzeCode;
  const submitCodeImpl = deps.submitCodeImpl;
  const saveRoastImpl = deps.saveRoastImpl;
  const headersImpl = deps.headersImpl ?? headers;
  const now = deps.now ?? (() => new Date());
  const logError =
    deps.logError ??
    ((event: string, payload: Record<string, unknown>) => {
      console.error(event, payload);
    });

  const parsed = createRoastInputSchema.safeParse(input);
  if (!parsed.success) {
    return buildValidationError("input invalido para criar roast");
  }

  try {
    validateCodeLimits(parsed.data.code);
  } catch {
    return buildValidationError("codigo excede limite de 300 linhas ou 12 KB");
  }

  const requestHeaders = await headersImpl();
  const ip = pickClientIp(
    requestHeaders.get("x-forwarded-for"),
    requestHeaders.get("x-real-ip"),
  );

  const rateLimit = await evaluateRateLimitWindowImpl({
    key: ip,
    now: now(),
  });

  if (!rateLimit.allowed) {
    return {
      ok: false,
      error: {
        code: "RATE_LIMIT",
        message: "limite de roasts por hora atingido",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
    };
  }

  try {
    const submitCodeAction =
      submitCodeImpl ?? (await import("./submit-code")).submitCode;
    const saveRoastAction =
      saveRoastImpl ?? (await import("./save-roast")).saveRoast;

    const analysis = await analyzeCodeImpl({
      code: parsed.data.code,
      language: parsed.data.language,
      roastMode: parsed.data.roastMode,
    });

    const submission = await submitCodeAction({
      code: parsed.data.code,
      language: parsed.data
        .language as (typeof languageEnum.enumValues)[number],
    });

    const roast = await saveRoastAction({
      submissionId: submission.id,
      output: analysis,
      modelUsed: analysis.modelUsed,
    });

    return {
      ok: true,
      roastId: roast.id,
    };
  } catch (_error) {
    logError("roast_create_failed", {
      code: "AI_ERROR",
      language: parsed.data.language,
      codeBytes: new TextEncoder().encode(parsed.data.code).length,
      roastMode: parsed.data.roastMode,
      modelUsed: process.env.OPENAI_MODEL ?? null,
    });

    return {
      ok: false,
      error: {
        code: "AI_ERROR",
        message: "nao foi possivel gerar roast, tente novamente",
      },
    };
  }
}

export type {
  CreateRoastActionError,
  CreateRoastActionInput,
  CreateRoastActionResult,
};
export { createRoastAction };
