/**
 * Content filtering utilities for comments and user-generated content
 * Protects against spam, inappropriate content, and malicious links
 */

// Common inappropriate words (Russian + English)
const INAPPROPRIATE_WORDS = [
  // Add your list here - keeping it minimal for example
  "spam", "scam", "fake", "bot",
  // Russian words (examples - add more as needed)
  "спам", "мошенник", "фейк",
];

// URL detection regex
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/gi;

// Email detection regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// Repeated characters detection (e.g., "aaaaaaa", "!!!!!!")
const REPEATED_CHARS_REGEX = /(.)\1{6,}/g;

export interface ContentFilterResult {
  isValid: boolean;
  reason?: string;
  sanitizedText?: string;
}

/**
 * Check if text contains URLs or email addresses
 */
function containsLinks(text: string): boolean {
  return URL_REGEX.test(text) || EMAIL_REGEX.test(text);
}

/**
 * Check if text contains inappropriate words
 */
function containsInappropriateWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return INAPPROPRIATE_WORDS.some((word) => lowerText.includes(word.toLowerCase()));
}

/**
 * Check if text is spam (excessive repeated characters)
 */
function isSpam(text: string): boolean {
  // Check for repeated characters
  if (REPEATED_CHARS_REGEX.test(text)) {
    return true;
  }

  // Check if text is too repetitive (same word repeated many times)
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  const uniqueWords = new Set(words).size;

  // If more than 70% of words are identical, it's likely spam
  if (wordCount > 5 && uniqueWords / wordCount < 0.3) {
    return true;
  }

  return false;
}

/**
 * Check if user is posting too frequently (rate limiting helper)
 * This should be used with a database or cache to track user actions
 */
export function checkRateLimit(
  lastCommentTime: Date | null,
  minIntervalSeconds: number = 10
): { allowed: boolean; waitTime?: number } {
  if (!lastCommentTime) {
    return { allowed: true };
  }

  const now = new Date();
  const timeSinceLastComment = (now.getTime() - lastCommentTime.getTime()) / 1000;

  if (timeSinceLastComment < minIntervalSeconds) {
    const waitTime = Math.ceil(minIntervalSeconds - timeSinceLastComment);
    return { allowed: false, waitTime };
  }

  return { allowed: true };
}

/**
 * Main content filter function
 * Returns validation result with reason if content is invalid
 */
export function validateCommentContent(text: string): ContentFilterResult {
  // 1. Check length
  if (text.trim().length === 0) {
    return {
      isValid: false,
      reason: "Comment cannot be empty",
    };
  }

  if (text.length > 1000) {
    return {
      isValid: false,
      reason: "Comment is too long (max 1000 characters)",
    };
  }

  // 2. Check for links
  if (containsLinks(text)) {
    return {
      isValid: false,
      reason: "Links and email addresses are not allowed in comments",
    };
  }

  // 3. Check for inappropriate content
  if (containsInappropriateWords(text)) {
    return {
      isValid: false,
      reason: "Comment contains inappropriate content",
    };
  }

  // 4. Check for spam
  if (isSpam(text)) {
    return {
      isValid: false,
      reason: "Comment appears to be spam",
    };
  }

  // All checks passed
  return {
    isValid: true,
    sanitizedText: text.trim(),
  };
}

/**
 * Sanitize text by removing potentially harmful content
 * Use this for display purposes
 */
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(URL_REGEX, "[link removed]")
    .replace(EMAIL_REGEX, "[email removed]");
}

/**
 * Get a user-friendly error message for content filter failures
 */
export function getFilterErrorMessage(reason?: string): string {
  switch (reason) {
    case "Comment cannot be empty":
      return "Please write something in your comment 🧵";
    case "Comment is too long (max 1000 characters)":
      return "Your comment is too long. Please keep it under 1000 characters 📝";
    case "Links and email addresses are not allowed in comments":
      return "Sorry, links and email addresses are not allowed. Keep the discussion here! 💬";
    case "Comment contains inappropriate content":
      return "Please keep comments friendly and respectful 🤝";
    case "Comment appears to be spam":
      return "Your comment looks like spam. Please write something meaningful ✨";
    default:
      return reason || "Invalid comment content";
  }
}
