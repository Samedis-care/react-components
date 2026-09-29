import ImageLoadError from "./ImageLoadError";
/**
 * Is the image passed on as it is, rather than drawn on a canvas?
 * @param sourceType The mime type of the image
 * @param targetType The mime type to convert the image to
 * @param downscale Settings to downscale the image
 * @remarks An SVG scales on its own, so it is only rasterized to give up its aspect ratio
 */
export const skipsCanvas = (sourceType, targetType, downscale) => targetType === "image/svg+xml" ||
    ((!downscale || downscale.keepRatio) && sourceType === "image/svg+xml");
/**
 * Loads an image
 * @param src The image's URL (an object URL or a data URI)
 * @param mimeType The image's mime type, for the error
 * @throws ImageLoadError if the browser cannot decode the image
 */
export const loadImage = (src, mimeType) => new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    // the error event carries no information about the failure, so don't try to read one off it
    image.addEventListener("error", () => reject(new ImageLoadError(mimeType)));
    image.src = src;
});
/**
 * Draws an image on a canvas of its own, down-scaled if it is too large
 * @param image The loaded image
 * @param downscale Settings to downscale the image
 */
export const drawImage = (image, downscale) => {
    let newWidth = image.width;
    let newHeight = image.height;
    if (downscale &&
        (image.width > downscale.width || image.height > downscale.height)) {
        if (!downscale.keepRatio) {
            newWidth = Math.min(image.width, downscale.width);
            newHeight = Math.min(image.height, downscale.height);
        }
        else {
            const downscaleRatio = Math.max(image.width / downscale.width, image.height / downscale.height);
            newWidth = image.width / downscaleRatio;
            newHeight = image.height / downscaleRatio;
        }
    }
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("Failed getting Canvas 2D Context");
    ctx.drawImage(image, 0, 0, newWidth, newHeight);
    return canvas;
};
