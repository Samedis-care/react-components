/**
 * Converts data URI to a blob
 * @param data The data URI
 * @return The blob
 */
var dataToFile = function (data) {
    // handle empty data uri
    if (data === "data:")
        return new Blob([new Uint8Array(0)]);
    var arr = data.split(",");
    if (arr.length < 2)
        throw new Error("Invalid data uri: " + data.slice(0, 64));
    var mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || mimeMatch.length < 2)
        throw new Error("mimeMatch invalid");
    var mime = mimeMatch[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};
export default dataToFile;
