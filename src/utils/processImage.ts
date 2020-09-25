import { fileToData } from "./index";

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

	// data url -> image
	const image = new Image();
	await new Promise((resolve, reject) => {
		image.addEventListener("load", () => resolve(image));
		image.addEventListener("error", (evt) => reject(evt.error));
		image.src = imageData;
	});

	// calculate new size for down-scaling
	let newWidth = image.width;
	let newHeight = image.height;
	if (
		downscale &&
		(image.width > downscale.width || image.height > downscale.height)
	) {
		if (!downscale.keepRatio) {
			newWidth = image.width <= downscale.width ? image.width : downscale.width;
			newHeight =
				image.width <= downscale.height ? image.height : downscale.height;
		} else {
			const downscaleRatio = Math.max(
				image.width / downscale.width,
				image.height / downscale.height
			);
			newWidth = image.width / downscaleRatio;
			newHeight = image.height / downscaleRatio;
		}
	}

	// render image in canvas with new size
	const canvas = document.createElement("canvas");
	canvas.width = newWidth;
	canvas.height = newHeight;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Failed getting Canvas 2D Context");
	ctx.drawImage(image, 0, 0, newWidth, newHeight);

	// and export it using the specified data format
	return canvas.toDataURL(imageFormatTarget);
};

export default processImage;
