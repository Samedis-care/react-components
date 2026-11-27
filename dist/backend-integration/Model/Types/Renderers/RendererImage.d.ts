import React from "react";
import ModelRenderParams from "../../RenderParams";
import TypeImage from "../TypeImage";
/**
 * Renders an image selector
 * @remarks In a form, a required visibility marks the field's frame (ImageSelector's
 *          `required`): an asterisk after the label, and "Required" as its description.
 */
declare class RendererImage extends TypeImage {
    render(params: ModelRenderParams<string | Blob>): React.ReactElement;
}
export default RendererImage;
