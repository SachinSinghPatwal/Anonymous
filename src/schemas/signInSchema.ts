import { z } from "zod";

export const signInSchema: any = z.object({
  Identifier: z.string(),
  password: z.string(),
});
