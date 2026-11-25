import React from "react";
import Type, { TypeSettings } from "../Type";
import ModelRenderParams from "../RenderParams";
import FilterType from "../FilterType";
import { ImageSelectorProps } from "../../../standalone/FileUpload/Image/ImageSelector";
export type TypeImageParams = Partial<Pick<ImageSelectorProps, "uploadLabel" | "convertImagesTo" | "downscale" | "capture" | "variant" | "postEditCallback" | "disableRotation">> & {
    /**
     * Fallback image to display when no image is stored: its URL or data URI, or a function
     * of the record's values that returns it (`undefined` for none), for a fallback that
     * depends on the record, e.g. a company or a person silhouette by the record's type.
     * A function that reads other fields lists them in `placeholderValues`, so the field
     * renders again when they change.
     * Where the image is only shown (a grid cell, a read-only form field), the placeholder's
     * alt text is "No image present"; without a placeholder that text is shown instead.
     * In an editable field it is the ImageSelector's `placeholder`, not the field's value: drawn
     * where the picture would be, skipped by assistive technology, and never previewed.
     * Defaults to none.
     */
    placeholder?: string | TypeImagePlaceholderFunction;
    /**
     * The fields a `placeholder` function reads (the type's `TypeSettings.updateHooks`): a
     * form field renders again when one of them changes, so its placeholder follows them.
     * Defaults to none.
     */
    placeholderValues?: string[];
};
/**
 * Picks an image field's placeholder from the record: its URL or data URI, or `undefined`
 * for none
 * @param values The record's values; in a form, the fields listed in `placeholderValues`
 *               are current
 * @returns The placeholder's URL or data URI, or `undefined`
 */
export type TypeImagePlaceholderFunction = (values: Record<string, unknown>) => string | undefined;
/**
 * A type to handle images
 * @remarks The value is the image's URL (or data URI), empty for no image, or an image the
 *          user picked as Blob (a File). The Blob is sent as it is: RailsApiClient uploads it
 *          as a file.
 */
declare abstract class TypeImage implements Type<string | Blob> {
    protected params?: TypeImageParams;
    /**
     * The fields a `placeholder` function reads re-render the field
     */
    settings?: TypeSettings;
    constructor(params?: TypeImageParams);
    /**
     * The placeholder for the record with `values`
     * @param values The record's values (`RenderParams.values`)
     * @returns The placeholder's URL or data URI, or `undefined` for none
     */
    protected getPlaceholder(values: Record<string, unknown>): string | undefined;
    getParams(): TypeImageParams;
    abstract render(params: ModelRenderParams<string | Blob>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string | Blob;
    stringify(value: string | Blob): string;
}
export default TypeImage;
