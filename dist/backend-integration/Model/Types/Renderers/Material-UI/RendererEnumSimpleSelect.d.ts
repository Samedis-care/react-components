import React from "react";
import { ModelRenderParams } from "../../../index";
import TypeEnum from "../../TypeEnum";
/**
 * Renders TypeEnum as drop-down selector (without search)
 */
declare class RendererEnumSelect extends TypeEnum {
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererEnumSelect;
