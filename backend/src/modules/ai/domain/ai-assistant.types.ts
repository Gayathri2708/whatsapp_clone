import { z } from "zod";

/**
 * Shared contracts for the "AI Assistant" module (Tone Guard + Catch-Me-Up).
 * These Zod schemas double as the structured-output contract enforced on
 * the Claude response (parse + validate) and as the TypeScript types used
 * throughout the module.
 */

export const toneAnalysisSchema = z.object({
  flagged: z.boolean(),
  tone: z.enum(["neutral", "friendly", "frustrated", "angry", "passive_aggressive", "rude"]),
  suggestion: z.string().nullable(),
});
export type ToneAnalysis = z.infer<typeof toneAnalysisSchema>;

export const chatSummarySchema = z.object({
  summary: z.array(z.string()),
  actionItems: z.array(z.string()),
});
export type ChatSummary = z.infer<typeof chatSummarySchema>;

export interface ChatMessageInput {
  senderName: string;
  text: string;
  sentAt: string; // ISO 8601 timestamp
}

/**
 * Port that the AI Assistant's use cases depend on. Two implementations:
 *  - `AnthropicAIProvider` (infrastructure/anthropic-provider.ts) — calls
 *    the Claude API.
 *  - `MockAIProvider` (infrastructure/mock-ai-provider.ts) — deterministic
 *    heuristics, used when `ANTHROPIC_API_KEY` is not configured so the
 *    app runs end-to-end without a paid API key.
 */
export interface IAIProvider {
  /** Tone Guard: checked before a message is sent. */
  analyzeTone(message: string): Promise<ToneAnalysis>;

  /** Catch-Me-Up: summarizes a batch of unread messages from a chat. */
  summarizeMessages(messages: ChatMessageInput[]): Promise<ChatSummary>;
}
