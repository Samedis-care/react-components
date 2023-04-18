import { IDownscaleProps } from "./processImage";
/**
 * Processes an image file
 * @param imageData The image (as data uri)
 * @param convertImagesTo MimeType to convert the image to (e.g. image/png or image/jpg)
 * @param downscale Settings to downscale an image
 */
declare const processImageB64: (imageData: string, convertImagesTo: string, downscale?: IDownscaleProps | undefined) => Promise<string>;
export default processImageB64;
