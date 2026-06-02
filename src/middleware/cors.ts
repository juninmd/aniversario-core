import cors from "cors";

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (allowedOrigins.includes("*")) {
      // Do not allow credentials when matching wildcard to prevent CORS exploitation
      callback(null, false);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Request-Id"],
  credentials: true,
  maxAge: 86400,
});
