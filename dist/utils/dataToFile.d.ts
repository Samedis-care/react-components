/**
 * Converts data URI to a File (preserving name) or Blob
 * @param data The data URI
 * @return The File or Blob
 */
declare const dataToFile: (data: string) => Blob;
export default dataToFile;
