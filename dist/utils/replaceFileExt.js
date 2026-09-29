const EXTENSIONS = {
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
};
/**
 * The file name for a file converted to another type
 * @param name The original file name
 * @param mimeType The new mime type
 * @returns The name with the extension of the new type
 */
const replaceFileExt = (name, mimeType) => {
    const extension = EXTENSIONS[mimeType] ?? mimeType.split("/")[1];
    const dot = name.lastIndexOf(".");
    return `${dot > 0 ? name.substring(0, dot) : name}.${extension}`;
};
export default replaceFileExt;
