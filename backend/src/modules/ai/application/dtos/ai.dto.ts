import { z } from "zod";

export const analyzeToneSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1, "message is required").max(2000),
  }),
});
export type AnalyzeToneInput = z.infer<typeof analyzeToneSchema>["body"];

export const summarizeMessagesSchema = z.object({
  body: z.object({
    messages: z
      .array(
        z.object({
          senderName: z.string().min(1),
          text: z.string().min(1),
          sentAt: z.string().datetime(),
        }),
      )
      .min(1, "messages must contain at least one item")
      .max(100, "messages cannot exceed 100 items per request"),
  }),
});
export type SummarizeMessagesInput = z.infer<typeof summarizeMessagesSchema>["body"];
