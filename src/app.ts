import express from "express";
import helmet from "helmet";
import { generalLimiter, corsMiddleware, errorHandler } from "./middleware";
import anniversariesRouter from "./routes/anniversaries";
import authRouter from "./routes/auth";

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(generalLimiter);
app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRouter);
app.use("/api/anniversaries", anniversariesRouter);

app.use("*", (_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use(errorHandler);

export default app;
