import { excerpt } from "./excerpt";

export function resolveDescription(description: unknown, content: string): string {
  if (typeof description === "string" && description.trim()) {
    return description.trim();
  }
  return excerpt(content);
}
