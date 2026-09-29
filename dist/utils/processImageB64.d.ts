import type { IDownscaleProps } from "./processImage";
/**
 * Processes an image given as data URI
 * @param imageData The image (as data uri)
 * @param convertImagesTo MimeType to convert the image to (e.g. image/png or image/jpg)
 * @param downscale Settings to downscale an image
 * @throws ImageLoadError if the browser cannot decode the image
 * @remarks For an image the user picked, prefer processImage: it never turns the file into
 *          a base64 string
 */
declare const processImageB64: (imageData: string, convertImagesTo: string, downscale?: IDownscaleProps) => Promise<string>;
export default processImageB64;
