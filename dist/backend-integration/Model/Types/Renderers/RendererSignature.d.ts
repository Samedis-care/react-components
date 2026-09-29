import React from "react";
import ModelRenderParams from "../../RenderParams";
import TypeSignature from "../TypeSignature";
export declare const SignatureNameContext: React.Context<string | null>;
/**
 * Renders a signature field (for electronic signing)
 * Wrap FormField with SignatureNameContext.Provider for name context
 */
declare class RendererSignature extends TypeSignature {
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererSignature;
