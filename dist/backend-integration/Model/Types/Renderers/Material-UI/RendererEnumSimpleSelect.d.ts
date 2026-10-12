import React from "react";
import ModelRenderParams from "../../../RenderParams";
import TypeEnum from "../../TypeEnum";
/**
 * Renders TypeEnum as drop-down selector (without search)
 */
declare class RendererEnumSelect<T extends string = string> extends TypeEnum<T> {
    render(params: ModelRenderParams<T>): React.ReactElement;
}
export default RendererEnumSelect;
