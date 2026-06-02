import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";

const TEST_SECRET = "test-secret-for-auth-routes";
process.env.JWT_SECRET = TEST_SECRET;
process.env.NODE_ENV = "test";

describe("Auth Routes", () => {
  describe("POST /api/auth/register", () => {
    it("registers a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "freshuser", password: "StrongPass1!" });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("rejects duplicate username", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ username: "dupeuser", password: "StrongPass1!" });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "dupeuser", password: "OtherPass1!" });
      expect(res.status).toBe(401);
    });

    it("rejects short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "user1", password: "123" });
      expect(res.status).toBe(400);
    });

    it("rejects empty username", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "", password: "StrongPass1!" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ username: "loginuser", password: "StrongPass1!" });
    });

    it("logs in with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "loginuser", password: "StrongPass1!" });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it("rejects wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "loginuser", password: "WrongPass1!" });
      expect(res.status).toBe(401);
    });

    it("rejects nonexistent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "nobody", password: "StrongPass1!" });
      expect(res.status).toBe(401);
    });

    it("issues a valid JWT token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "loginuser", password: "StrongPass1!" });

      const decoded = jwt.verify(res.body.data.token, TEST_SECRET) as any;
      expect(decoded.username).toBe("loginuser");
      expect(decoded.role).toBe("user");
    });
  });
});
