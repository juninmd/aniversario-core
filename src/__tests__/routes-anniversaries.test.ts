import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";

const TEST_SECRET = "test-secret-for-anniversary-routes";
process.env.JWT_SECRET = TEST_SECRET;
process.env.NODE_ENV = "test";

function getToken(role: "admin" | "user" = "user"): string {
  return jwt.sign({ id: "test-user", username: "testuser", role }, TEST_SECRET, {
    expiresIn: "1h",
  });
}

describe("Anniversaries Routes", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe("GET /api/anniversaries", () => {
    it("returns empty list when no anniversaries exist", async () => {
      const res = await request(app)
        .get("/api/anniversaries")
        .set("Authorization", `Bearer ${getToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it("returns list with created anniversaries", async () => {
      const token = getToken("admin");

      await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Mom Birthday", date: "2025-05-10", type: "birthday" });

      const res = await request(app)
        .get("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /api/anniversaries/:id", () => {
    it("returns 404 for non-existent id", async () => {
      const res = await request(app)
        .get("/api/anniversaries/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${getToken()}`);
      expect(res.status).toBe(404);
    });

    it("returns 400 for invalid UUID", async () => {
      const res = await request(app)
        .get("/api/anniversaries/invalid-id")
        .set("Authorization", `Bearer ${getToken()}`);
      expect(res.status).toBe(400);
    });

    it("returns anniversary by id", async () => {
      const token = getToken("admin");

      const createRes = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test Anniversary", date: "2025-06-15", type: "wedding" });

      const id = createRes.body.data.id;
      const res = await request(app)
        .get(`/api/anniversaries/${id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Test Anniversary");
    });
  });

  describe("POST /api/anniversaries", () => {
    it("creates an anniversary with valid data", async () => {
      const token = getToken("admin");
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John Doe",
          date: "2024-06-15",
          type: "birthday",
          notes: "My best friend",
        });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe("John Doe");
      expect(res.body.data.type).toBe("birthday");
      expect(res.body.data.id).toBeDefined();
    });

    it("rejects user role from creating with invalid data", async () => {
      const res = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", "Bearer " + getToken("user"))
        .send({ name: "", date: "invalid", type: "unknown" });
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/anniversaries/:id", () => {
    it("allows admin to delete", async () => {
      const adminToken = getToken("admin");

      const createRes = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "To Delete", date: "2024-06-15", type: "birthday" });

      const id = createRes.body.data.id;
      const res = await request(app)
        .delete(`/api/anniversaries/${id}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("blocks user role from deleting", async () => {
      const userToken = getToken("user");
      const adminToken = getToken("admin");

      const createRes = await request(app)
        .post("/api/anniversaries")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "No Delete", date: "2024-06-15", type: "birthday" });

      const id = createRes.body.data.id;
      const res = await request(app)
        .delete(`/api/anniversaries/${id}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it("returns 401 without auth", async () => {
      const res = await request(app).delete("/api/anniversaries/some-id");
      expect(res.status).toBe(401);
    });
  });
});
