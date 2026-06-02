import request from "supertest";
import app from "../app";

process.env.JWT_SECRET = "test-secret-for-app-tests";
process.env.NODE_ENV = "test";

describe("App", () => {
  describe("GET /health", () => {
    it("returns 200 with status ok", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("ok");
    });
  });

  describe("404 handling", () => {
    it("returns 404 for unknown routes", async () => {
      const res = await request(app).get("/unknown-route");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Route not found");
    });

    it("returns 404 for /api/unknown", async () => {
      const res = await request(app).get("/api/unknown");
      expect(res.status).toBe(404);
    });
  });

  describe("Request body size limit", () => {
    it("rejects oversized payloads", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .send({ name: "x".repeat(20 * 1024) });
      expect(res.status).toBe(413);
    });
  });
});
