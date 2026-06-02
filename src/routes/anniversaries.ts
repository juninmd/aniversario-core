import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import type { Anniversary, CreateAnniversaryInput, ApiResponse } from "../types";
import { AuthRequest, authenticate, authorize, validateCreateAnniversary, validateId, createAnniversaryLimiter } from "../middleware";
import { NotFoundError } from "../utils/errors";
import { sanitizeInput } from "../utils/validation";

const router = Router();

const anniversaries: Anniversary[] = [];

router.get(
  "/",
  authenticate,
  (_req: AuthRequest, res) => {
    const response: ApiResponse<Anniversary[]> = {
      success: true,
      data: anniversaries,
    };
    res.json(response);
  },
);

router.get(
  "/:id",
  authenticate,
  ...validateId,
  (req: AuthRequest, res) => {
    const anniversary = anniversaries.find((a) => a.id === req.params.id);
    if (!anniversary) {
      throw new NotFoundError("Anniversary");
    }
    const response: ApiResponse<Anniversary> = {
      success: true,
      data: anniversary,
    };
    res.json(response);
  },
);

router.post(
  "/",
  authenticate,
  authorize("admin", "user"),
  createAnniversaryLimiter,
  ...validateCreateAnniversary,
  (req: AuthRequest, res) => {
    const sanitized = sanitizeInput<CreateAnniversaryInput>({
      name: req.body.name,
      date: req.body.date,
      type: req.body.type,
      notes: req.body.notes,
    });

    const anniversary: Anniversary = {
      id: uuidv4(),
      name: sanitized.name,
      date: sanitized.date,
      type: sanitized.type,
      notes: sanitized.notes,
    };

    anniversaries.push(anniversary);

    const response: ApiResponse<Anniversary> = {
      success: true,
      data: anniversary,
    };
    res.status(201).json(response);
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  ...validateId,
  (req: AuthRequest, res) => {
    const index = anniversaries.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      throw new NotFoundError("Anniversary");
    }
    anniversaries.splice(index, 1);
    const response: ApiResponse = { success: true };
    res.json(response);
  },
);

export default router;
