/**
 * The file name for a file converted to another type
 * @param name The original file name
 * @param mimeType The new mime type
 * @returns The name with the extension of the new type
 */
declare const replaceFileExt: (name: string, mimeType: string) => string;
export default replaceFileExt;
