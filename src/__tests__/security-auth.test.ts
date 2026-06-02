import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";

const TEST_SECRET = "test-secret-that-is-long-enough-for-ci";
process.env.JWT_SECRET = TEST_SECRET;
process.env.NODE_ENV = "test";

function getToken(role: "admin" | "user" = "user"): string {
  return jwt.sign(
    { id: "test-user", username: "testuser", role },
    TEST_SECRET,
    { expiresIn: "1h" },
  );
}

describe("Authentication Security", () => {
  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "existinguser", password: "ValidPass123!" });
  });

  describe("POST /api/auth/register", () => {
    it("registers a user with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "newuser1", password: "SecurePass123!" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("rejects registration with short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "newuser2", password: "123" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects registration with empty username", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "", password: "SecurePass123!" });

      expect(res.status).toBe(400);
    });

    it("rejects registration with SQL injection in username", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "admin' OR '1'='1", password: "SecurePass123!" });

      expect(res.status).toBe(400);
    });

    it("rejects registration with XSS in username", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "<script>alert(1)</script>", password: "SecurePass123!" });

      expect(res.status).toBe(400);
    });

    it("rejects duplicate username", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "existinguser", password: "OtherPass123!" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "existinguser", password: "ValidPass123!" });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it("rejects login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "existinguser", password: "WrongPassword1!" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("rejects login for nonexistent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "nonexistent", password: "SomePass123!" });

      expect(res.status).toBe(401);
    });

    it("rejects login with empty body", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({});

      expect(res.status).toBe(400);
    });

    it("rejects login with oversized payload", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "A".repeat(1000), password: "B".repeat(1000) });

      expect(res.status).toBe(400);
    });
  });

  describe("JWT Token Security", () => {
    it("issues a valid token on successful login", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ username: "existinguser", password: "ValidPass123!" });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.token).toBeDefined();

      const decoded = jwt.verify(loginRes.body.data.token, TEST_SECRET);
      expect(decoded).toHaveProperty("username", "existinguser");
    });

    it("rejects tampered token", async () => {
      const res = await request(app)
        .get("/api/anniversaries")
        .set("Authorization", "Bearer tampered.token.here");

      expect(res.status).toBe(401);
    });

    it("rejects request without token", async () => {
      const res = await request(app).get("/api/anniversaries");
      expect(res.status).toBe(401);
    });

    it("rejects request with malformed authorization header", async () => {
      const res = await request(app)
        .get("/api/anniversaries")
        .set("Authorization", "Basic somerandomcreds");

      expect(res.status).toBe(401);
    });

    it("accepts valid token", async () => {
      const token = getToken();
      const res = await request(app)
        .get("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});
