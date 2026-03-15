/**
 * Utility functions for generating SEO-friendly slugs
 * Supports transliteration from Cyrillic to Latin
 */

// Cyrillic to Latin transliteration map
const cyrillicToLatinMap: Record<string, string> = {
  // Russian
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
  'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
  'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
  'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
  'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
  'э': 'e', 'ю': 'yu', 'я': 'ya',

  // Uppercase
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D',
  'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z', 'И': 'I',
  'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
  'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
  'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch',
  'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '',
  'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
};

/**
 * Transliterate Cyrillic text to Latin
 */
function transliterate(text: string): string {
  return text
    .split('')
    .map(char => cyrillicToLatinMap[char] || char)
    .join('');
}

/**
 * Generate a URL-friendly slug from text
 * - Transliterates Cyrillic to Latin
 * - Converts to lowercase
 * - Replaces spaces and special chars with hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start/end
 *
 * @param text - Input text to slugify
 * @param maxLength - Maximum length (default: 60)
 * @returns URL-friendly slug
 */
export function generateSlug(text: string, maxLength: number = 60): string {
  return transliterate(text)
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Trim hyphens from start and end
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, maxLength)
    // Remove trailing hyphen if cut mid-word
    .replace(/-+$/, '');
}

/**
 * Generate a unique slug by appending a number if needed
 *
 * @param baseSlug - Base slug to start with
 * @param existingSlugs - Array of already existing slugs to avoid
 * @returns Unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  let slug = baseSlug;
  let counter = 1;

  // Keep trying with incrementing numbers until we find a unique slug
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Generate username slug from name or email
 * Fallback to a random string if input is invalid
 *
 * @param name - User's name
 * @param email - User's email (fallback)
 * @returns Username slug
 */
export function generateUsernameSlug(
  name: string | null | undefined,
  email: string
): string {
  if (name && name.trim()) {
    return generateSlug(name, 30);
  }

  // Extract username from email (before @)
  const emailUsername = email.split('@')[0];
  return generateSlug(emailUsername, 30);
}

/**
 * Validate slug format
 * Must be lowercase alphanumeric with hyphens, no leading/trailing hyphens
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Generate challenge slug from title and dates
 */
export function generateChallengeSlug(
  title: string,
  startDate: Date
): string {
  const monthYear = startDate.toISOString().substring(0, 7); // YYYY-MM
  const titleSlug = generateSlug(title, 40);
  return `${titleSlug}-${monthYear}`;
}
