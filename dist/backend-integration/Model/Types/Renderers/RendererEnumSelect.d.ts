import React from "react";
import ModelRenderParams from "../../RenderParams";
import TypeEnum, { EnumValue } from "../TypeEnum";
import { BaseSelectorData, BaseSelectorProps } from "../../../../standalone/Selector";
export type RendererEnumSelectProps = Omit<BaseSelectorProps<BaseSelectorData>, "selected" | "onLoad" | "onSelect" | "disabled">;
export type AdvancedEnumValue = Omit<BaseSelectorData, "label"> & Pick<EnumValue, "getLabel" | "invisible" | "invisibleInGridFilter">;
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererEnumSelect extends TypeEnum {
    private props?;
    constructor(values: AdvancedEnumValue[], props?: RendererEnumSelectProps, numericMode?: boolean);
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererEnumSelect;
