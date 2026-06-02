import {
  sanitizeString,
  isValidDate,
  isValidName,
  isValidType,
  isValidNotes,
  sanitizeInput,
} from "../utils/validation";

describe("Sanitization", () => {
  describe("sanitizeString", () => {
    it("removes HTML tags", () => {
      expect(sanitizeString("<script>alert('xss')</script>")).not.toContain("<");
      expect(sanitizeString("<script>alert('xss')</script>")).not.toContain(">");
    });

    it("removes javascript: protocol", () => {
      expect(sanitizeString("javascript:alert(1)")).not.toMatch(/javascript:/i);
    });

    it("removes event handlers", () => {
      expect(sanitizeString("onclick=alert(1)")).not.toMatch(/onclick=/i);
      expect(sanitizeString("onload=alert(1)")).not.toMatch(/onload=/i);
      expect(sanitizeString("onerror=alert(1)")).not.toMatch(/onerror=/i);
    });

    it("trims whitespace", () => {
      expect(sanitizeString("  hello  ")).toBe("hello");
    });

    it("preserves normal text", () => {
      expect(sanitizeString("John Doe")).toBe("John Doe");
    });

    it("handles empty string", () => {
      expect(sanitizeString("")).toBe("");
    });

    it("removes null bytes", () => {
      expect(sanitizeString("hello\x00world")).toBe("helloworld");
    });

    it("removes HTML tags from mixed content", () => {
      const result = sanitizeString("Hello <img src=x onerror=alert(1)> World");
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
      expect(result).toContain("Hello");
      expect(result).toContain("World");
    });
  });

  describe("sanitizeInput", () => {
    it("sanitizes all string fields in an object", () => {
      const input = {
        name: "<script>alert(1)</script>John",
        notes: "  Hello <b>world</b>  ",
        type: "birthday",
      };
      const result = sanitizeInput(input);
      expect(result.name).not.toContain("<");
      expect(result.notes).not.toContain("<");
      expect(result.notes).not.toContain(">");
    });

    it("preserves non-string fields", () => {
      const input = {
        name: "Test",
        count: 42,
        active: true,
      };
      const result = sanitizeInput(input);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
    });
  });
});

describe("Validation", () => {
  describe("isValidDate", () => {
    it("accepts valid dates", () => {
      expect(isValidDate("2024-01-15")).toBe(true);
      expect(isValidDate("1990-06-01")).toBe(true);
      expect(isValidDate("2025-12-31")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(isValidDate("01-15-2024")).toBe(false);
      expect(isValidDate("2024/01/15")).toBe(false);
      expect(isValidDate("2024-1-1")).toBe(false);
      expect(isValidDate("not-a-date")).toBe(false);
    });

    it("rejects impossible dates", () => {
      expect(isValidDate("2024-02-30")).toBe(false);
      expect(isValidDate("2024-13-01")).toBe(false);
      expect(isValidDate("2024-00-10")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isValidDate("")).toBe(false);
    });

    it("rejects SQL injection in date field", () => {
      expect(isValidDate("2024-01-01'; DROP TABLE users; --")).toBe(false);
    });

    it("rejects XSS in date field", () => {
      expect(isValidDate("<script>alert(1)</script>")).toBe(false);
    });
  });

  describe("isValidName", () => {
    it("accepts valid names", () => {
      expect(isValidName("John")).toBe(true);
      expect(isValidName("Maria José")).toBe(true);
      expect(isValidName("João Silva Jr.")).toBe(true);
      expect(isValidName("A")).toBe(true);
    });

    it("rejects empty string", () => {
      expect(isValidName("")).toBe(false);
    });

    it("rejects names exceeding length limit", () => {
      expect(isValidName("A".repeat(201))).toBe(false);
    });

    it("rejects names with HTML tags", () => {
      expect(isValidName("<script>alert(1)</script>")).toBe(false);
    });

    it("rejects names with special characters", () => {
      expect(isValidName("John@Doe")).toBe(false);
      expect(isValidName("John#1")).toBe(false);
      expect(isValidName("John; DROP TABLE")).toBe(false);
    });

    it("rejects non-string inputs", () => {
      expect(isValidName(null as unknown as string)).toBe(false);
      expect(isValidName(undefined as unknown as string)).toBe(false);
      expect(isValidName(123 as unknown as string)).toBe(false);
    });
  });

  describe("isValidType", () => {
    it("accepts valid types", () => {
      expect(isValidType("birthday")).toBe(true);
      expect(isValidType("wedding")).toBe(true);
      expect(isValidType("other")).toBe(true);
    });

    it("rejects invalid types", () => {
      expect(isValidType("anniversary")).toBe(false);
      expect(isValidType("")).toBe(false);
      expect(isValidType("birthday; DROP TABLE")).toBe(false);
    });
  });

  describe("isValidNotes", () => {
    it("accepts valid notes", () => {
      expect(isValidNotes("Some notes here")).toBe(true);
      expect(isValidNotes("")).toBe(true);
    });

    it("accepts undefined or null", () => {
      expect(isValidNotes(undefined)).toBe(true);
      expect(isValidNotes(null)).toBe(true);
    });

    it("rejects notes exceeding length limit", () => {
      expect(isValidNotes("A".repeat(501))).toBe(false);
    });

    it("rejects non-string notes", () => {
      expect(isValidNotes(123)).toBe(false);
      expect(isValidNotes({})).toBe(false);
      expect(isValidNotes([])).toBe(false);
    });
  });
});
