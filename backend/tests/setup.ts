// Runs before the test framework is installed and before any test file is
// loaded, so these env vars are in place when `src/config/env.ts` is first
// imported (it validates `process.env` at module-load time).
process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET = "test-access-token-secret-please-ignore-1234";
process.env.JWT_REFRESH_SECRET = "test-refresh-token-secret-please-ignore-5678";
// Real connection happens via mongodb-memory-server in each test file's
// beforeAll; this placeholder only needs to satisfy env validation.
process.env.MONGODB_URI = "mongodb://localhost:27017/whatsapp_clone_test";
