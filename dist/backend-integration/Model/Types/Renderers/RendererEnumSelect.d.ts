import React from "react";
import ModelRenderParams from "../../RenderParams";
import TypeEnum, { EnumValue } from "../TypeEnum";
import { BaseSelectorData, BaseSelectorProps } from "../../../../standalone/Selector";
export type RendererEnumSelectProps = Omit<BaseSelectorProps<BaseSelectorData, false>, "selected" | "onLoad" | "onSelect" | "disabled" | "autoFocus">;
export type AdvancedEnumValue<T extends string = string> = Omit<BaseSelectorData, "label" | "value"> & Pick<EnumValue<T>, "value" | "getLabel" | "invisible" | "invisibleInGridFilter">;
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererEnumSelect<T extends string = string> extends TypeEnum<T> {
    private props?;
    constructor(values: AdvancedEnumValue<T>[], defaultValue: NoInfer<T>, props?: RendererEnumSelectProps, numericMode?: boolean);
    render(params: ModelRenderParams<T>): React.ReactElement;
}
export default RendererEnumSelect;
