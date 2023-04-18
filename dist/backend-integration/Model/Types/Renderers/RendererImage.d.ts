import React from "react";
import { ModelRenderParams } from "../../index";
import TypeImage from "../TypeImage";
/**
 * Renders an image selector
 */
declare class RendererImage extends TypeImage {
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererImage;
