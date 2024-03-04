import fileToData from "./fileToData";
import processImageB64 from "./processImageB64";
/**
 * Processes an image file
 * @param file The image file
 * @param convertImagesTo MimeType to convert the image to (e.g. image/png or image/jpg)
 * @param downscale Settings to downscale an image
 */
const processImage = async (file, convertImagesTo, downscale) => {
    const imageFormatTarget = convertImagesTo || file.type;
    // file -> data url
    const imageData = await fileToData(file);
    return processImageB64(imageData, imageFormatTarget, downscale);
};
export default processImage;
