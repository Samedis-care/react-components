import React from "react";
import { ModelRenderParams } from "../../../index";
import TypeEnum, { EnumValue } from "../../TypeEnum";
export declare type WrapButtonFunc = (btn: React.ReactElement, value: EnumValue) => React.ReactElement;
/**
 * Renders TypeEnum as radio buttons
 */
declare class RendererEnumRadio extends TypeEnum {
    protected horizontal: boolean;
    protected wrapButton: WrapButtonFunc;
    constructor(values: EnumValue[], horizontal?: boolean, wrapButton?: WrapButtonFunc, numericMode?: boolean);
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererEnumRadio;
