/**
 * Sanitization utility to protect against Cross-Site Scripting (XSS),
 * HTML tag injection, and dangerous characters in user input.
 */

export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/\0/g, "") // Remove null bytes
    .replace(/</g, "&lt;") // Encode angle brackets
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;") // Encode double quotes
    .replace(/'/g, "&#x27;") // Encode single quotes
    .trim();
}

export function sanitizeTextarea(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }

  // Preserve line breaks while stripping dangerous HTML/scripts
  return input
    .replace(/\0/g, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/onerror\s*=/gi, "")
    .replace(/onload\s*=/gi, "")
    .replace(/onclick\s*=/gi, "")
    .replace(/<[^>]+>/g, "") // Strip all HTML tags
    .trim();
}

export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (value !== null && typeof value === "object") {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}
