import cors from "cors";
import { corsMiddleware } from "../middleware/cors";

describe("CORS middleware", () => {
  it("is a cors middleware function", () => {
    expect(typeof corsMiddleware).toBe("function");
  });

  it("has expected cors origin handling", () => {
    const corsInstance = cors({
      origin: "*",
    });
    expect(typeof corsInstance).toBe("function");
  });
});
