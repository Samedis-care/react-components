import { drawImage, loadImage, skipsCanvas } from "./imageCanvas";
import replaceFileExt from "./replaceFileExt";

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
 * @returns The processed image. A File stays a File, with its extension following a
 *          changed type.
 * @throws ImageLoadError if the browser cannot decode the image
 * @remarks The image is never read into a base64 string. A browser that cannot encode the
 *          requested type encodes PNG, the returned image's type tells.
 */
function processImage(
	file: File,
	convertImagesTo?: string,
	downscale?: IDownscaleProps,
): Promise<File>;
function processImage(
	file: Blob,
	convertImagesTo?: string,
	downscale?: IDownscaleProps,
): Promise<Blob>;
async function processImage(
	file: Blob,
	convertImagesTo?: string,
	downscale?: IDownscaleProps,
): Promise<Blob> {
	const imageFormatTarget = convertImagesTo || file.type;
	if (skipsCanvas(file.type, imageFormatTarget, downscale)) return file;

	const url = URL.createObjectURL(file);
	let processed: Blob | null;
	try {
		const image = await loadImage(url, file.type || null);
		const canvas = drawImage(image, downscale);
		processed = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, imageFormatTarget),
		);
	} finally {
		URL.revokeObjectURL(url);
	}
	if (!processed) throw new Error("Failed encoding the image");

	if (!(file instanceof File)) return processed;
	return new File(
		[processed],
		processed.type === file.type
			? file.name
			: replaceFileExt(file.name, processed.type),
		{ type: processed.type, lastModified: file.lastModified },
	);
}

export default processImage;
