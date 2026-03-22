import "server-only";
import { cache } from "react";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const getCaller = cache(() => appRouter.createCaller(createTRPCContext()));

export { getCaller };
