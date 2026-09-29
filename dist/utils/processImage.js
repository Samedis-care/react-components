import { drawImage, loadImage, skipsCanvas } from "./imageCanvas";
import replaceFileExt from "./replaceFileExt";
async function processImage(file, convertImagesTo, downscale) {
    const imageFormatTarget = convertImagesTo || file.type;
    if (skipsCanvas(file.type, imageFormatTarget, downscale))
        return file;
    const url = URL.createObjectURL(file);
    let processed;
    try {
        const image = await loadImage(url, file.type || null);
        const canvas = drawImage(image, downscale);
        processed = await new Promise((resolve) => canvas.toBlob(resolve, imageFormatTarget));
    }
    finally {
        URL.revokeObjectURL(url);
    }
    if (!processed)
        throw new Error("Failed encoding the image");
    if (!(file instanceof File))
        return processed;
    return new File([processed], processed.type === file.type
        ? file.name
        : replaceFileExt(file.name, processed.type), { type: processed.type, lastModified: file.lastModified });
}
export default processImage;
