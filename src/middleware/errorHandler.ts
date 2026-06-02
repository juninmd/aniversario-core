import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

interface PayloadTooLargeError extends Error {
  type: string;
  expected: number;
  length: number;
  limit: number;
}

function isPayloadTooLarge(err: Error): err is PayloadTooLargeError {
  return (
    (err as PayloadTooLargeError).type === "entity.too.large"
  );
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (isPayloadTooLarge(err)) {
    res.status(413).json({
      success: false,
      error: "Request entity too large",
    });
    return;
  }

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  console.error("Unexpected error:", err);

  res.status(500).json({
    success: false,
    error: "An unexpected error occurred",
  });
}
