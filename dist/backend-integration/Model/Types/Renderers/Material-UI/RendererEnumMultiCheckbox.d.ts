import React from "react";
import { ModelRenderParams } from "../../../index";
import TypeEnumMulti from "../../TypeEnumMulti";
import { EnumValue } from "../../TypeEnum";
export declare type WrapButtonFunc = (btn: React.ReactElement, value: EnumValue) => React.ReactElement;
/**
 * Renders TypeEnumMulti as checkboxes
 */
declare class RendererEnumRadio extends TypeEnumMulti {
    protected horizontal: boolean;
    protected wrapButton: WrapButtonFunc;
    constructor(values: EnumValue[], horizontal?: boolean, wrapButton?: WrapButtonFunc);
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererEnumRadio;
