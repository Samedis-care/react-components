import React from "react";
import { ModelRenderParams } from "../../index";
import TypeImage from "../TypeImage";
/**
 * Renders an signature field (for electronic signing)
 */
declare class RendererSignature extends TypeImage {
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererSignature;
