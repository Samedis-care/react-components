export declare const isImageLoadError: (e: Error) => e is ImageLoadError;
/**
 * The browser was unable to decode an image
 * @remarks Happens for formats the browser doesn't support (HEIC, TIFF, ...) and for corrupt files.
 *          The browser tells us nothing about the reason: the "error" event on HTMLImageElement is
 *          a plain Event without any detail (the DOM lib mistypes it as ErrorEvent), so the mime
 *          type we tried to load is all we can report.
 */
export default class ImageLoadError extends Error {
    /**
     * The mime type of the image which failed to load, if it could be determined
     */
    mimeType: string | null;
    constructor(mimeType: string | null);
}
