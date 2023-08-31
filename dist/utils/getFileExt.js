/**
 * Gets the extension of the given file name
 * @param name The file name
 */
const getFileExt = (name) => {
    const fileSplit = name.split(".");
    return fileSplit[fileSplit.length - 1] || "";
};
export default getFileExt;
