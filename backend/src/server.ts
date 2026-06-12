import { createApp } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";
import { logger } from "./config/logger";

async function main(): Promise<void> {
  await connectDB();

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

main().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
