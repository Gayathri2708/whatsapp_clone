import { MockAIProvider } from "../../src/modules/ai/infrastructure/mock-ai-provider";

describe("MockAIProvider", () => {
  const provider = new MockAIProvider();

  describe("analyzeTone", () => {
    it("does not flag a neutral message", async () => {
      const result = await provider.analyzeTone("Hey, are we still on for lunch tomorrow?");

      expect(result.flagged).toBe(false);
      expect(result.tone).toBe("neutral");
      expect(result.suggestion).toBeNull();
    });

    it("flags a message containing harsh language and offers a rewrite", async () => {
      const result = await provider.analyzeTone("This plan is stupid and a waste of time.");

      expect(result.flagged).toBe(true);
      expect(result.suggestion).not.toBeNull();
      expect(result.suggestion).not.toContain("stupid");
    });
  });

  describe("summarizeMessages", () => {
    it("returns an empty summary for no messages", async () => {
      const result = await provider.summarizeMessages([]);

      expect(result).toEqual({ summary: [], actionItems: [] });
    });

    it("summarizes messages and extracts action items from questions/requests", async () => {
      const result = await provider.summarizeMessages([
        { senderName: "Sam", text: "Hey, how's the report going?", sentAt: "2026-06-10T10:00:00Z" },
        {
          senderName: "Priya",
          text: "Almost done, can you review section 3?",
          sentAt: "2026-06-10T10:05:00Z",
        },
        { senderName: "Sam", text: "Sure thing.", sentAt: "2026-06-10T10:06:00Z" },
      ]);

      expect(result.summary.length).toBeGreaterThan(0);
      expect(result.actionItems.some((item) => item.includes("review section 3"))).toBe(true);
    });
  });
});
