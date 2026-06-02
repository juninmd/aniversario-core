import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
} from "../utils/errors";

describe("AppError", () => {
  it("creates an operational error by default", () => {
    const err = new AppError(400, "Bad request");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Bad request");
    expect(err.isOperational).toBe(true);
  });

  it("creates a non-operational error", () => {
    const err = new AppError(500, "Internal", false);
    expect(err.isOperational).toBe(false);
  });

  it("has the correct prototype chain", () => {
    const err = new AppError(400, "test");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe("ValidationError", () => {
  it("has status 400", () => {
    const err = new ValidationError("Invalid input");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Invalid input");
    expect(err).toBeInstanceOf(AppError);
  });
});

describe("AuthenticationError", () => {
  it("has status 401 with default message", () => {
    const err = new AuthenticationError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Authentication required");
  });

  it("has status 401 with custom message", () => {
    const err = new AuthenticationError("Custom auth error");
    expect(err.message).toBe("Custom auth error");
  });
});

describe("AuthorizationError", () => {
  it("has status 403 with default message", () => {
    const err = new AuthorizationError();
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe("Insufficient permissions");
  });

  it("has status 403 with custom message", () => {
    const err = new AuthorizationError("Custom authz error");
    expect(err.message).toBe("Custom authz error");
  });
});

describe("NotFoundError", () => {
  it("has status 404 with default message", () => {
    const err = new NotFoundError();
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Resource not found");
  });

  it("has status 404 with custom resource name", () => {
    const err = new NotFoundError("User");
    expect(err.message).toBe("User not found");
  });
});

describe("RateLimitError", () => {
  it("has status 429", () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.message).toBe("Too many requests, please try again later");
  });
});
