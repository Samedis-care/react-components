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
declare const processImage: (file: File, convertImagesTo?: string, downscale?: IDownscaleProps) => Promise<string>;
export default processImage;
