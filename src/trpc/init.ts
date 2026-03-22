import "server-only";
import { initTRPC } from "@trpc/server";

function createTRPCContext() {
  return {};
}

const t = initTRPC.context<typeof createTRPCContext>().create();

const router = t.router;
const publicProcedure = t.procedure;

export { createTRPCContext, publicProcedure, router };
