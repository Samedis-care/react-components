/**
 * Gets the extension of the given file name
 * @param name The file name
 */
var getFileExt = function (name) {
    var fileSplit = name.split(".");
    return fileSplit[fileSplit.length - 1] || "";
};
export default getFileExt;
