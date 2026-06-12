import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "../../src/app";
import { connectDB, disconnectDB } from "../../src/config/database";

describe("Auth API", () => {
  let mongoServer: MongoMemoryServer;
  const app = createApp();

  const credentials = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "supersecret123",
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectDB(mongoServer.getUri());
  });

  afterAll(async () => {
    await disconnectDB();
    await mongoServer.stop();
  });

  afterEach(async () => {
    const { collections } = mongoose.connection;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
  });

  describe("POST /api/v1/auth/register", () => {
    it("creates a new user and returns a token pair", async () => {
      const res = await request(app).post("/api/v1/auth/register").send(credentials);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({ name: credentials.name, email: credentials.email });
      expect(res.body.data.user).not.toHaveProperty("passwordHash");
      expect(res.body.data.tokens.accessToken).toEqual(expect.any(String));
      expect(res.body.data.tokens.refreshToken).toEqual(expect.any(String));
    });

    it("rejects a duplicate email with 409", async () => {
      await request(app).post("/api/v1/auth/register").send(credentials);

      const res = await request(app).post("/api/v1/auth/register").send(credentials);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("rejects invalid input with 400", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "A", email: "not-an-email", password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("logs in with correct credentials", async () => {
      await request(app).post("/api/v1/auth/register").send(credentials);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: credentials.email, password: credentials.password });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toEqual(expect.any(String));
    });

    it("rejects an incorrect password with 401", async () => {
      await request(app).post("/api/v1/auth/register").send(credentials);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: credentials.email, password: "wrong-password" });

      expect(res.status).toBe(401);
    });

    it("rejects an unknown email with 401", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nobody@example.com", password: credentials.password });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/users/me", () => {
    it("returns the authenticated user's profile", async () => {
      const registerRes = await request(app).post("/api/v1/auth/register").send(credentials);
      const { accessToken } = registerRes.body.data.tokens;

      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(credentials.email);
    });

    it("rejects requests without an Authorization header with 401", async () => {
      const res = await request(app).get("/api/v1/users/me");

      expect(res.status).toBe(401);
    });

    it("rejects requests with an invalid token with 401", async () => {
      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", "Bearer not-a-real-token");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    it("issues a new token pair for a valid refresh token", async () => {
      const registerRes = await request(app).post("/api/v1/auth/register").send(credentials);
      const { refreshToken } = registerRes.body.data.tokens;

      const res = await request(app).post("/api/v1/auth/refresh").send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toEqual(expect.any(String));
      expect(res.body.data.refreshToken).toEqual(expect.any(String));
    });

    it("rejects a reused (rotated) refresh token", async () => {
      const registerRes = await request(app).post("/api/v1/auth/register").send(credentials);
      const { refreshToken } = registerRes.body.data.tokens;

      await request(app).post("/api/v1/auth/refresh").send({ refreshToken });
      const res = await request(app).post("/api/v1/auth/refresh").send({ refreshToken });

      expect(res.status).toBe(401);
    });

    it("rejects a malformed refresh token with 401", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: "not-a-real-token" });

      expect(res.status).toBe(401);
    });
  });
});
