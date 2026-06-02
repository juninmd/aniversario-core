import { body, param, validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/errors";

export function handleValidationErrors(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new ValidationError(messages.join("; "));
  }
  next();
}

export const validateCreateAnniversary = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Name must be between 1 and 200 characters")
    .matches(/^[a-zA-ZÀ-ÿ\s'.-]+$/)
    .withMessage("Name contains invalid characters"),
  body("date")
    .isString()
    .withMessage("Date must be a string")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date must be in YYYY-MM-DD format")
    .custom((value: string) => {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        throw new Error("Date must be a valid calendar date");
      }
      const [y, m, d] = value.split("-").map(Number);
      if (
        parsed.getFullYear() !== y ||
        parsed.getMonth() + 1 !== m ||
        parsed.getDate() !== d
      ) {
        throw new Error("Date must be a valid calendar date");
      }
      return true;
    }),
  body("type")
    .isString()
    .withMessage("Type must be a string")
    .isIn(["birthday", "wedding", "other"])
    .withMessage("Type must be one of: birthday, wedding, other"),
  body("notes")
    .optional()
    .isString()
    .withMessage("Notes must be a string")
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters")
    .custom((value: string) => {
      if (/[<>]/.test(value)) {
        throw new Error("Notes must not contain HTML tags");
      }
      return true;
    }),
  handleValidationErrors,
];

export const validateId = [
  param("id")
    .isString()
    .withMessage("ID must be a string")
    .isUUID()
    .withMessage("ID must be a valid UUID"),
  handleValidationErrors,
];

export const validateLogin = [
  body("username")
    .isString()
    .withMessage("Username must be a string")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be between 3 and 50 characters")
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage("Username contains invalid characters"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters"),
  handleValidationErrors,
];
