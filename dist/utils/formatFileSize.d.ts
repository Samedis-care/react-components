/**
 * Formats a file size for display, e.g. 15728640 bytes as "15 MB"
 * @param bytes The size in bytes
 * @param locale The locale to format for, e.g. from useCurrentLocale
 * @returns The size in the largest unit it fills at least once, with at most one decimal
 * @remarks Each unit is 1024 of the one below, as Rails counts them, so that a limit the
 *          backend defines as `15.megabytes` reads as 15 MB rather than 15.7.
 */
declare const formatFileSize: (bytes: number, locale: string) => string;
export default formatFileSize;
