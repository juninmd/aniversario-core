import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";

const TEST_SECRET = "test-secret-that-is-long-enough-for-ci";
process.env.JWT_SECRET = TEST_SECRET;
process.env.NODE_ENV = "test";

function getToken(role: "admin" | "user" = "user"): string {
  return jwt.sign({ id: "test-user", username: "testuser", role }, TEST_SECRET, {
    expiresIn: "1h",
  });
}

describe("API Security", () => {
  describe("Rate Limiting", () => {
    it("allows requests under the rate limit", async () => {
      const token = getToken();
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .get("/api/anniversaries")
          .set("Authorization", `Bearer ${token}`);
        expect(res.status).not.toBe(429);
      }
    });
  });

  describe("CORS", () => {
    it("allows requests from allowed origins", async () => {
      const res = await request(app).get("/health").set("Origin", "http://localhost:3000");
      expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    });

    it("includes security headers via helmet", async () => {
      const res = await request(app).get("/health");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
      expect(res.headers["x-xss-protection"]).toBe("0");
    });
  });

  describe("Input Validation - Create Anniversary", () => {
    const token = getToken("admin");

    it("creates anniversary with valid input", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John Doe",
          date: "2024-06-15",
          type: "birthday",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("John Doe");
    });

    it("rejects anniversary with SQL injection in name", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John'; DROP TABLE anniversaries; --",
          date: "2024-06-15",
          type: "birthday",
        });

      expect(res.status).toBe(400);
    });

    it("rejects anniversary with XSS in name", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "<script>alert('xss')</script>",
          date: "2024-06-15",
          type: "birthday",
        });

      expect(res.status).toBe(400);
    });

    it("rejects anniversary with invalid date format", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John Doe",
          date: "invalid-date",
          type: "birthday",
        });

      expect(res.status).toBe(400);
    });

    it("rejects anniversary with impossible date", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John Doe",
          date: "2024-02-30",
          type: "birthday",
        });

      expect(res.status).toBe(400);
    });

    it("rejects anniversary with invalid type", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John Doe",
          date: "2024-06-15",
          type: "hacker-attack",
        });

      expect(res.status).toBe(400);
    });

    it("rejects anniversary with oversized name", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "A".repeat(201),
          date: "2024-06-15",
          type: "birthday",
        });

      expect(res.status).toBe(400);
    });

    it("rejects anniversary with XSS in notes", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John Doe",
          date: "2024-06-15",
          type: "birthday",
          notes: "<img src=x onerror=alert(1)>",
        });

      expect(res.status).toBe(400);
    });

    it("rejects anniversary with oversized notes", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John Doe",
          date: "2024-06-15",
          type: "birthday",
          notes: "A".repeat(501),
        });

      expect(res.status).toBe(400);
    });

    it("rejects anniversary with empty body", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("Authorization", () => {
    it("allows admin to delete anniversaries", async () => {
      const adminToken = getToken("admin");

      const createRes = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "To Delete",
          date: "2024-06-15",
          type: "birthday",
        });

      expect(createRes.status).toBe(201);
      const id = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/anniversaries/${id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });

    it("rejects user role from deleting anniversaries", async () => {
      const userToken = getToken("user");

      const createRes = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "No Delete",
          date: "2024-06-15",
          type: "birthday",
        });

      expect(createRes.status).toBe(201);
      const id = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/anniversaries/${id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(deleteRes.status).toBe(403);
    });

    it("rejects unauthenticated requests", async () => {
      const res = await request(app).delete("/api/anniversaries/some-id");
      expect(res.status).toBe(401);
    });
  });

  describe("Error Handling", () => {
    it("returns 404 for unknown routes without leaking internals", async () => {
      const res = await request(app).get("/api/nonexistent-route");

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
      expect(res.text).not.toContain("Error:");
      expect(res.text).not.toContain("at ");
      expect(res.text).not.toContain("node_modules");
    });

    it("does not leak stack traces on validation errors", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${getToken()}`)
        .send({ name: "", date: "", type: "" });

      expect(res.status).toBe(400);
      expect(res.text).not.toContain("at ");
      expect(res.text).not.toContain("node_modules");
    });

    it("limits request body size", async () => {
      const largePayload = {
        name: "John Doe",
        date: "2024-06-15",
        type: "birthday",
        notes: "x".repeat(11 * 1024),
      };
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${getToken()}`)
        .send(largePayload);

      expect(res.status).toBe(413);
    });
  });
});
