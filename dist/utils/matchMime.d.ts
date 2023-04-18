/**
 * Matches a mime type to a mime type pattern
 * @param pattern The mime type pattern (e.g. "image/*")
 * @param actual The actual mime type to match (e.g. "image/jpg")
 * @returns true if actual matches pattern, otherwise false
 */
declare const matchMime: (pattern: string, actual: string) => boolean;
export default matchMime;
