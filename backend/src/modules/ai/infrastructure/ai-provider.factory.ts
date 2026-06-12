import { env } from "../../../config/env";
import { logger } from "../../../config/logger";
import { IAIProvider } from "../domain/ai-assistant.types";
import { AnthropicAIProvider } from "./anthropic-provider";
import { MockAIProvider } from "./mock-ai-provider";

/**
 * Selects the AI provider based on environment configuration. Application
 * code depends only on `IAIProvider`, so this is the single place that
 * decides "real Claude API" vs "mock" — no other file needs an `if` for it.
 */
export function createAIProvider(): IAIProvider {
  if (env.ANTHROPIC_API_KEY) {
    return new AnthropicAIProvider(env.ANTHROPIC_API_KEY);
  }

  logger.warn(
    "ANTHROPIC_API_KEY not set — using MockAIProvider. Set ANTHROPIC_API_KEY in .env to enable real Tone Guard / Catch-Me-Up responses.",
  );
  return new MockAIProvider();
}
