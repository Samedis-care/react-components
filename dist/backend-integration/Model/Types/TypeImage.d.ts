import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { ImageSelectorProps } from "../../../standalone/FileUpload/Image/ImageSelector";
export declare type TypeImageParams = Partial<Pick<ImageSelectorProps, "uploadLabel" | "convertImagesTo" | "downscale" | "capture" | "variant">>;
/**
 * A type to handle images
 */
declare abstract class TypeImage implements Type<string> {
    protected params?: TypeImageParams;
    constructor(params?: TypeImageParams);
    getParams(): TypeImageParams;
    abstract render(params: ModelRenderParams<string>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string;
    stringify(value: string): string;
}
export default TypeImage;
