/**
 * Calculate reading time and character count for a given text
 * @param text - The text content to analyze
 * @returns Object with reading time in minutes and character count
 */
export function calculateReadingTime(text: string): { minutes: number; charCount: number } {
  // Remove code blocks and inline code
  const textWithoutCode = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`]+`/g, "");

  // Count all characters (including spaces)
  const charCount = textWithoutCode.length;

  // Calculate reading time: 500 characters per minute
  const minutes = Math.max(1, Math.ceil(charCount / 500));

  return { minutes, charCount };
}

/**
 * Format reading time for display
 * @param minutes - Reading time in minutes
 * @param charCount - Character count
 * @returns Formatted string (e.g., "5 min read (2,500字)")
 */
export function formatReadingTime(minutes: number, charCount: number): string {
  return `${minutes} min`;
}
