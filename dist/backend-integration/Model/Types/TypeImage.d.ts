import React from "react";
import Type from "../Type";
import ModelRenderParams from "../RenderParams";
import FilterType from "../FilterType";
import { ImageSelectorProps } from "../../../standalone/FileUpload/Image/ImageSelector";
export type TypeImageParams = Partial<Pick<ImageSelectorProps, "uploadLabel" | "convertImagesTo" | "downscale" | "capture" | "variant" | "postEditCallback">> & {
    /**
     * Fallback image to display
     */
    placeholder?: string;
};
/**
 * A type to handle images
 * @remarks The value is the image's URL (or data URI), empty for no image, or an image the
 *          user picked as Blob (a File). The Blob is sent as it is: RailsApiClient uploads it
 *          as a file.
 */
declare abstract class TypeImage implements Type<string | Blob> {
    protected params?: TypeImageParams;
    constructor(params?: TypeImageParams);
    getParams(): TypeImageParams;
    abstract render(params: ModelRenderParams<string | Blob>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string | Blob;
    stringify(value: string | Blob): string;
}
export default TypeImage;
