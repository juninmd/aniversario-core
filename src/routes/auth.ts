import { Router, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { ApiResponse, User } from "../types";
import { authLimiter, validateLogin } from "../middleware";
import { AuthenticationError, ValidationError } from "../utils/errors";

const router = Router();

interface StoredUser {
  username: string;
  passwordHash: string;
  role: "admin" | "user";
}

const users: StoredUser[] = [];

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
};

const JWT_EXPIRY = process.env.JWT_EXPIRY || "24h";

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post(
  "/register",
  authLimiter,
  ...validateLogin,
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const existing = users.find((u) => u.username === username);
    if (existing) {
      throw new ValidationError("Username already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    users.push({
      username,
      passwordHash,
      role: "user",
    });

    const response: ApiResponse = {
      success: true,
      data: { message: "User registered successfully" },
    };
    res.status(201).json(response);
  }),
);

router.post(
  "/login",
  authLimiter,
  ...validateLogin,
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username);
    
    // Use a dummy hash to prevent timing attacks when the user is not found
    const dummyHash = "$2b$12$Lqy8K7R.77K7R.77K7R.7uV8Y7R.77K7R.77K7R.77K7R.77K7R.7";
    const passwordHash = user ? user.passwordHash : dummyHash;
    const passwordValid = await bcrypt.compare(password, passwordHash);

    if (!user || !passwordValid) {
      throw new AuthenticationError("Invalid username or password");
    }

    const tokenPayload: User = {
      id: username,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, getJwtSecret(), {
      expiresIn: JWT_EXPIRY,
      issuer: "aniversario-core",
    });

    const response: ApiResponse<{ token: string }> = {
      success: true,
      data: { token },
    };
    res.json(response);
  }),
);

export default router;
