/**
 * Converts a file to a base64 data uri
 * @param file The file to convert
 * @param includeName Include the file name in the base64 data uri as name parameter?
 */
declare const fileToData: (file: File, includeName?: boolean) => Promise<string>;
export default fileToData;
