import fileToData from "./fileToData";
import processImageB64 from "./processImageB64";

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
	downscale?: IDownscaleProps,
): Promise<string> => {
	const imageFormatTarget = convertImagesTo || file.type;

	// file -> data url
	const imageData: string = await fileToData(file);

	// skip this if we're not doing anything except resize and it's a svg
	if (
		convertImagesTo === "image/svg+xml" ||
		(!convertImagesTo &&
			(!downscale || downscale.keepRatio) &&
			file.type === "image/svg+xml")
	)
		return imageData;

	return processImageB64(imageData, imageFormatTarget, downscale);
};

export default processImage;
