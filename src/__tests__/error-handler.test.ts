import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../middleware/errorHandler";
import { ValidationError, NotFoundError, AuthenticationError } from "../utils/errors";

function createMockRes(): Response {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("errorHandler", () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {} as Request;
    mockRes = createMockRes();
    mockNext = jest.fn();
  });

  it("handles operational AppError", () => {
    const err = new ValidationError("Invalid input");
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid input",
    });
  });

  it("handles NotFoundError", () => {
    const err = new NotFoundError("Anniversary");
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Anniversary not found",
    });
  });

  it("handles AuthenticationError", () => {
    const err = new AuthenticationError("Token expired");
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it("returns 500 for non-operational errors", () => {
    const err = new Error("Unexpected crash");
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "An unexpected error occurred",
    });
  });

  it("handles payload too large errors", () => {
    const err = new Error("Request entity too large") as Error & { type: string };
    err.type = "entity.too.large";
    errorHandler(err, mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(413);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Request entity too large",
    });
  });
});
