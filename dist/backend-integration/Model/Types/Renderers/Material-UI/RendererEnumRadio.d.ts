import React from "react";
import ModelRenderParams from "../../../RenderParams";
import TypeEnum, { EnumValue } from "../../TypeEnum";
export type WrapButtonFunc = (btn: React.ReactElement, value: EnumValue) => React.ReactElement;
/**
 * Renders TypeEnum as radio buttons
 */
declare class RendererEnumRadio<T extends string = string> extends TypeEnum<T> {
    protected horizontal: boolean;
    protected wrapButton: WrapButtonFunc;
    constructor(values: EnumValue<T>[], defaultValue: NoInfer<T>, horizontal?: boolean, wrapButton?: WrapButtonFunc, numericMode?: boolean);
    render(params: ModelRenderParams<T>): React.ReactElement;
}
export default RendererEnumRadio;
