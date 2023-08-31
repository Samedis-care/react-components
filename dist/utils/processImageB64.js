/**
 * Processes an image file
 * @param imageData The image (as data uri)
 * @param convertImagesTo MimeType to convert the image to (e.g. image/png or image/jpg)
 * @param downscale Settings to downscale an image
 */
const processImageB64 = async (imageData, convertImagesTo, downscale) => {
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
    if (downscale &&
        (image.width > downscale.width || image.height > downscale.height)) {
        if (!downscale.keepRatio) {
            newWidth = image.width <= downscale.width ? image.width : downscale.width;
            newHeight =
                image.width <= downscale.height ? image.height : downscale.height;
        }
        else {
            const downscaleRatio = Math.max(image.width / downscale.width, image.height / downscale.height);
            newWidth = image.width / downscaleRatio;
            newHeight = image.height / downscaleRatio;
        }
    }
    // render image in canvas with new size
    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx)
        throw new Error("Failed getting Canvas 2D Context");
    ctx.drawImage(image, 0, 0, newWidth, newHeight);
    // and export it using the specified data format
    return canvas.toDataURL(convertImagesTo);
};
export default processImageB64;
