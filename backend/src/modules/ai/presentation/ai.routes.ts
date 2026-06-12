import { Router } from "express";
import { asyncHandler } from "../../../shared/middlewares/async-handler";
import { authenticate } from "../../../shared/middlewares/authenticate.middleware";
import { validate } from "../../../shared/middlewares/validate.middleware";
import { analyzeToneSchema, summarizeMessagesSchema } from "../application/dtos/ai.dto";
import { AnalyzeToneUseCase } from "../application/use-cases/analyze-tone.usecase";
import { SummarizeMessagesUseCase } from "../application/use-cases/summarize-messages.usecase";
import { createAIProvider } from "../infrastructure/ai-provider.factory";
import { AIController } from "./ai.controller";

/**
 * Composition root for the AI Assistant module. All routes require
 * authentication — Tone Guard and Catch-Me-Up only make sense for a
 * logged-in user's own drafts/conversations.
 */
export function createAIRouter(): Router {
  const aiProvider = createAIProvider();

  const controller = new AIController(
    new AnalyzeToneUseCase(aiProvider),
    new SummarizeMessagesUseCase(aiProvider),
  );

  const router = Router();

  router.use(authenticate);
  router.post(
    "/tone-guard",
    validate(analyzeToneSchema),
    asyncHandler(controller.analyzeTone),
  );
  router.post(
    "/catch-me-up",
    validate(summarizeMessagesSchema),
    asyncHandler(controller.summarizeMessages),
  );

  return router;
}
