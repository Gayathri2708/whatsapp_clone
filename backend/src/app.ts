import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./shared/middlewares/error-handler.middleware";
import { notFoundHandler } from "./shared/middlewares/not-found.middleware";
import { createAuthController, createAuthRouter } from "./modules/auth/presentation/auth.routes";
import { createUsersRouter } from "./modules/auth/presentation/users.routes";
import { createAIRouter } from "./modules/ai/presentation/ai.routes";

/**
 * Builds the Express application without starting an HTTP server. Kept
 * separate from `server.ts` so integration tests can import this directly
 * (via supertest) without binding to a real port.
 */
export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  const authController = createAuthController();

  app.use("/api/v1/auth", createAuthRouter(authController));
  app.use("/api/v1/users", createUsersRouter(authController));
  app.use("/api/v1/ai", createAIRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
