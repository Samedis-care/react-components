import { fileToData, processImageB64 } from "./index";

export interface IDownscaleProps {
	/**
	 * The maximum allowed width
	 */
	width: number;
	/**
	 * The maximum allowed height
	 */
	height: number;
	/**
	 * Keep aspect ratio when scaling down?
	 */
	keepRatio: boolean;
}

/**
 * Processes an image file
 * @param file The image file
 * @param convertImagesTo MimeType to convert the image to (e.g. image/png or image/jpg)
 * @param downscale Settings to downscale an image
 */
const processImage = async (
	file: File,
	convertImagesTo?: string,
	downscale?: IDownscaleProps
): Promise<string> => {
	const imageFormatTarget = convertImagesTo || file.type;

	// file -> data url
	const imageData: string = await fileToData(file);

	return processImageB64(imageData, imageFormatTarget, downscale);
};

export default processImage;
