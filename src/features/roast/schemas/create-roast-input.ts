import { z } from "zod";

const createRoastInputSchema = z.object({
  code: z.string().min(1),
  language: z.enum(["javascript", "typescript", "python"]),
  roastMode: z.boolean(),
});

type CreateRoastInput = z.infer<typeof createRoastInputSchema>;

export type { CreateRoastInput };
export { createRoastInputSchema };
