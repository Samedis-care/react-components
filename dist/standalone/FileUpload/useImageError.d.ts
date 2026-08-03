/**
 * Called if an image the user selected couldn't be processed
 * @param error The error which happened (an ImageLoadError if the browser couldn't decode the image)
 * @param message A localized, human readable message
 * @remarks If this is set, no error dialog is shown, displaying the message is up to the handler.
 */
export type ImageErrorHandler = (error: Error, message: string) => void;
/**
 * Handles an error which happened while processing a user selected image
 * @param error The error which happened (any thrown value)
 * @remarks Reports the error and shows it to the user. Never throws.
 * @see useImageError
 */
export type ImageErrorReporter = (error: unknown) => void;
/**
 * Common error handling for the components which let the user select images
 * @param source Human readable identifier of the call site, for error reports
 * @param onError The owner's error handler. If unset, an error dialog is shown.
 */
declare const useImageError: (source: string, onError?: ImageErrorHandler) => ImageErrorReporter;
export default useImageError;
