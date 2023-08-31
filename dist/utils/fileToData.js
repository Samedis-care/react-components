/**
 * Converts a file to a base64 data uri
 * @param file The file to convert
 * @param includeName Include the file name in the base64 data uri as name parameter?
 */
const fileToData = async (file, includeName = false) => {
    // file -> data url
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.addEventListener("load", () => {
            let dataUri = reader.result;
            // if empty file in chromium
            if (dataUri === "data:") {
                // empty data uri in firefox
                dataUri = "data:application/octet-stream;base64,";
            }
            resolve(includeName
                ? dataUri.replace(";base64,", `;name=${encodeURIComponent(file.name)};base64,`)
                : dataUri);
        });
        reader.addEventListener("error", () => {
            reject(reader.error);
        });
        reader.readAsDataURL(file);
    });
};
export default fileToData;
