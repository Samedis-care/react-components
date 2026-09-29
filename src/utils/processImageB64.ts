import type { IDownscaleProps } from "./processImage";
import getDataUriMime from "./getDataUriMime";
import { drawImage, loadImage, skipsCanvas } from "./imageCanvas";

/**
 * Processes an image given as data URI
 * @param imageData The image (as data uri)
 * @param convertImagesTo MimeType to convert the image to (e.g. image/png or image/jpg)
 * @param downscale Settings to downscale an image
 * @throws ImageLoadError if the browser cannot decode the image
 * @remarks For an image the user picked, prefer processImage: it never turns the file into
 *          a base64 string
 */
const processImageB64 = async (
	imageData: string,
	convertImagesTo: string,
	downscale?: IDownscaleProps,
): Promise<string> => {
	const mimeType = getDataUriMime(imageData);
	if (skipsCanvas(mimeType, convertImagesTo, downscale)) return imageData;

	const image = await loadImage(imageData, mimeType);
	return drawImage(image, downscale).toDataURL(convertImagesTo);
};

export default processImageB64;
