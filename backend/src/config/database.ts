import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

/**
 * Connects to MongoDB. Accepts an optional URI override so tests can point
 * this at an in-memory MongoDB instance (mongodb-memory-server) without
 * needing a real database or touching the validated env config.
 */
export async function connectDB(uri: string = env.MONGODB_URI): Promise<typeof mongoose> {
  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(uri);

  logger.info(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);

  return connection;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
