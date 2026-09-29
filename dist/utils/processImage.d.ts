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
declare function processImage(file: File, convertImagesTo?: string, downscale?: IDownscaleProps): Promise<File>;
declare function processImage(file: Blob, convertImagesTo?: string, downscale?: IDownscaleProps): Promise<Blob>;
export default processImage;
