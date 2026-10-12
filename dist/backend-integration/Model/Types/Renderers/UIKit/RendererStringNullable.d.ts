import React from "react";
import TypeStringNullable from "../../TypeStringNullable";
import ModelRenderParams from "../../../RenderParams";
import type { ModelDataTypeStringRendererCCParams } from "./RendererString";
/**
 * Renders a text field for a string that can be unset (null)
 * @remarks null shows as empty. Editing sets a string, so a cleared field holds "", not null.
 */
declare class RendererStringNullable extends TypeStringNullable {
    props?: ModelDataTypeStringRendererCCParams;
    constructor(props?: ModelDataTypeStringRendererCCParams);
    render(params: ModelRenderParams<string | null> | ModelRenderParams<string>): React.ReactElement;
}
export default RendererStringNullable;
