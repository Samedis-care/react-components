import type { IDownscaleProps } from "./processImage";
/**
 * Is the image passed on as it is, rather than drawn on a canvas?
 * @param sourceType The mime type of the image
 * @param targetType The mime type to convert the image to
 * @param downscale Settings to downscale the image
 * @remarks An SVG scales on its own, so it is only rasterized to give up its aspect ratio
 */
export declare const skipsCanvas: (sourceType: string | null, targetType: string, downscale?: IDownscaleProps) => boolean;
/**
 * Loads an image
 * @param src The image's URL (an object URL or a data URI)
 * @param mimeType The image's mime type, for the error
 * @throws ImageLoadError if the browser cannot decode the image
 */
export declare const loadImage: (src: string, mimeType: string | null) => Promise<HTMLImageElement>;
/**
 * Draws an image on a canvas of its own, down-scaled if it is too large
 * @param image The loaded image
 * @param downscale Settings to downscale the image
 */
export declare const drawImage: (image: HTMLImageElement, downscale?: IDownscaleProps) => HTMLCanvasElement;
