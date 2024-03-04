import React from "react";
import ModelRenderParams from "../../RenderParams";
import TypeImage from "../TypeImage";
export declare const SignatureNameContext: React.Context<string | null>;
/**
 * Renders a signature field (for electronic signing)
 * Wrap FormField with SignatureNameContext.Provider for name context
 */
declare class RendererSignature extends TypeImage {
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererSignature;
