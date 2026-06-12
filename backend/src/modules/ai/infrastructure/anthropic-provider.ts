import Anthropic from "@anthropic-ai/sdk";
import {
  ChatMessageInput,
  ChatSummary,
  chatSummarySchema,
  IAIProvider,
  ToneAnalysis,
  toneAnalysisSchema,
} from "../domain/ai-assistant.types";
import { AIProviderError } from "../domain/ai-provider.errors";

// Tone Guard runs on every outgoing message, so it needs to be fast and
// cheap: a short classification + rewrite task is well within Haiku's
// capabilities at roughly 1/5th the cost of Sonnet.
const TONE_GUARD_MODEL = "claude-haiku-4-5";

// Catch-Me-Up reads a larger batch of messages and needs better synthesis,
// but is triggered on-demand (not per-keystroke), so the extra cost of
// Sonnet is justified by noticeably better summaries.
const SUMMARIZER_MODEL = "claude-sonnet-4-6";

const TONE_GUARD_SYSTEM_PROMPT = `You are "Tone Guard", a feature inside a chat app that helps users avoid \
sending messages that could come across as harsh before they hit send.

Analyze the user's draft message and respond with ONLY a JSON object matching this exact shape, \
no prose, no markdown fences:

{
  "flagged": boolean,        // true if the tone could upset the recipient
  "tone": "neutral" | "friendly" | "frustrated" | "angry" | "passive_aggressive" | "rude",
  "suggestion": string | null // a softer rewrite if flagged, else null
}

Be conservative: only flag messages that are genuinely likely to escalate a conversation. \
Do not flag normal directness, disagreement, or negative news delivered politely.`;

const SUMMARIZER_SYSTEM_PROMPT = `You are "Catch-Me-Up", a feature inside a chat app that summarizes \
unread messages for someone returning to a conversation.

Given a JSON array of messages (each with senderName, text, sentAt, in chronological order), \
respond with ONLY a JSON object matching this exact shape, no prose, no markdown fences:

{
  "summary": string[],     // 2-5 short bullet points covering what was discussed
  "actionItems": string[]  // concrete requests, questions, or decisions that need a response;
                            // empty array if there are none
}

Keep each bullet under 25 words. Do not invent information that isn't in the messages.`;

/**
 * Claude-backed implementation of IAIProvider. Reads the API key from the
 * already-validated env config — never hardcoded, never logged.
 *
 * Both methods follow the same pattern: send a system prompt that pins the
 * exact JSON shape expected, request the response as plain text, then
 * parse + validate it against a Zod schema. If the model ever returns
 * something that doesn't match the schema (or the request fails), we throw
 * `AIProviderError` rather than let malformed data flow into the app.
 */
export class AnthropicAIProvider implements IAIProvider {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async analyzeTone(message: string): Promise<ToneAnalysis> {
    try {
      const response = await this.client.messages.create({
        model: TONE_GUARD_MODEL,
        max_tokens: 256,
        system: TONE_GUARD_SYSTEM_PROMPT,
        messages: [{ role: "user", content: message }],
      });

      return toneAnalysisSchema.parse(extractJson(response));
    } catch (err) {
      throw new AIProviderError("Tone Guard request failed", { cause: err });
    }
  }

  async summarizeMessages(messages: ChatMessageInput[]): Promise<ChatSummary> {
    try {
      const response = await this.client.messages.create({
        model: SUMMARIZER_MODEL,
        max_tokens: 1024,
        // The system prompt is static across every call, so it's marked
        // for prompt caching: repeat calls only pay full input price for
        // the per-request message batch below.
        system: [
          {
            type: "text",
            text: SUMMARIZER_SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: JSON.stringify(messages) }],
      });

      return chatSummarySchema.parse(extractJson(response));
    } catch (err) {
      throw new AIProviderError("Catch-Me-Up request failed", { cause: err });
    }
  }
}

function extractJson(response: Anthropic.Message): unknown {
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Anthropic response contained no text block");
  }

  try {
    return JSON.parse(block.text);
  } catch {
    throw new Error(`Anthropic response was not valid JSON: ${block.text}`);
  }
}
