import { z } from "zod";

export const verifySchema = z.object({
  content: z
    .string()
    .length(10, "Content must be at least of 10 characters")
    .max(200, "Content must nly be upto 300 characters"),
});
