import React from "react";
import { ModelRenderParams } from "../../../index";
import TypeStringArray from "../TypeStringArray";
/**
 * No-op renderer for string array type
 */
declare class RendererBackendStringArray extends TypeStringArray {
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererBackendStringArray;
