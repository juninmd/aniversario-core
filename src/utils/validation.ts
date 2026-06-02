export function sanitizeString(input: string): string {
  return input
    .replace(/\0/g, "")
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

export function isValidDate(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }
  const [year, month, day] = dateString.split("-").map(Number);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

export function isValidName(name: string): boolean {
  if (typeof name !== "string") return false;
  if (name.length < 1 || name.length > 200) return false;
  return /^[\p{L}\s'.-]+$/u.test(name);
}

export function isValidType(type: string): boolean {
  return ["birthday", "wedding", "other"].includes(type);
}

export function isValidNotes(notes: unknown): boolean {
  if (notes === undefined || notes === null) return true;
  if (typeof notes !== "string") return false;
  return notes.length <= 500;
}

export function sanitizeInput<T extends object>(
  input: T,
): T {
  const sanitized = { ...input } as Record<string, unknown>;
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeString(sanitized[key] as string);
    }
  }
  return sanitized as T;
}
