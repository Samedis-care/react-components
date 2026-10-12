import React from "react";
import ModelRenderParams from "../../../RenderParams";
import TypeEnumMulti from "../../TypeEnumMulti";
import { EnumValue } from "../../TypeEnum";
export type WrapButtonFunc = (btn: React.ReactElement, value: EnumValue) => React.ReactElement;
/**
 * Renders TypeEnumMulti as checkboxes
 */
declare class RendererEnumRadio<T extends string = string> extends TypeEnumMulti<T> {
    protected horizontal: boolean;
    protected wrapButton: WrapButtonFunc;
    constructor(values: EnumValue<T>[], horizontal?: boolean, wrapButton?: WrapButtonFunc);
    render(params: ModelRenderParams<T[]>): React.ReactElement;
}
export default RendererEnumRadio;
