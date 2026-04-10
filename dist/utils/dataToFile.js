import getDataUriMime from "./getDataUriMime";
/**
 * Extracts the name parameter from a data URI if present
 * @param data The data URI
 * @return The decoded file name or null
 */
const getDataUriName = (data) => {
    const header = data.split(",")[0];
    const nameMatch = header.match(/;name=([^;,]+)/);
    if (!nameMatch || nameMatch.length < 2)
        return null;
    return decodeURIComponent(nameMatch[1]);
};
/**
 * Converts data URI to a File (preserving name) or Blob
 * @param data The data URI
 * @return The File or Blob
 */
const dataToFile = (data) => {
    // handle empty data uri
    if (data === "data:")
        return new Blob([new Uint8Array(0)]);
    const arr = data.split(",");
    if (arr.length < 2)
        throw new Error("Invalid data uri: " + data.slice(0, 64));
    const mime = getDataUriMime(data);
    if (!mime)
        throw new Error("mimeMatch invalid for data uri: " + data.slice(0, 64));
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    const name = getDataUriName(data);
    if (name) {
        return new File([u8arr], name, { type: mime });
    }
    return new Blob([u8arr], { type: mime });
};
export default dataToFile;
