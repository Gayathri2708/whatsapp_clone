import {
  ChatMessageInput,
  ChatSummary,
  IAIProvider,
  ToneAnalysis,
} from "../domain/ai-assistant.types";

const NEGATIVE_WORDS = [
  "stupid",
  "idiot",
  "hate",
  "shut up",
  "useless",
  "pathetic",
  "whatever",
  "screw",
];

/**
 * Heuristic, zero-cost stand-in for the Claude-backed provider. Used
 * automatically when `ANTHROPIC_API_KEY` is not set (see
 * `ai-provider.factory.ts`), so the API — and the mobile app — works out
 * of the box without an Anthropic account. Swapping to the real provider
 * is a one-line env var change, nothing else in the codebase needs to know.
 */
export class MockAIProvider implements IAIProvider {
  async analyzeTone(message: string): Promise<ToneAnalysis> {
    const lower = message.toLowerCase();
    const hit = NEGATIVE_WORDS.find((word) => lower.includes(word));

    if (!hit) {
      return { flagged: false, tone: "neutral", suggestion: null };
    }

    return {
      flagged: true,
      tone: lower.includes("hate") || lower.includes("idiot") ? "angry" : "frustrated",
      suggestion: message.replace(new RegExp(hit, "i"), "[that]").trim(),
    };
  }

  async summarizeMessages(messages: ChatMessageInput[]): Promise<ChatSummary> {
    if (messages.length === 0) {
      return { summary: [], actionItems: [] };
    }

    const participants = [...new Set(messages.map((m) => m.senderName))];
    const summary = [
      `${messages.length} new messages from ${participants.join(", ")}.`,
      `Most recent: "${messages[messages.length - 1].text.slice(0, 120)}"`,
    ];

    const actionItems = messages
      .filter((m) => /\?$|please|can you|could you|let's|lets/i.test(m.text))
      .slice(0, 5)
      .map((m) => `${m.senderName}: ${m.text}`);

    return { summary, actionItems };
  }
}
