import React from "react";
import { ModelRenderParams } from "../../../index";
import TypeEnumMulti, { AdvancedMultiEnumValue } from "../TypeEnumMulti";
import { MultiSelectorData, MultiSelectProps } from "../../../../standalone";
export declare type RendererEnumMultiSelectProps = Omit<MultiSelectProps<MultiSelectorData>, "label" | "selected" | "onLoad" | "onSelect" | "disabled">;
/**
 * Renders TypeEnumMulti as selector
 */
declare class RendererEnumMultiSelect extends TypeEnumMulti {
    props?: RendererEnumMultiSelectProps;
    constructor(values: AdvancedMultiEnumValue[], props?: RendererEnumMultiSelectProps);
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererEnumMultiSelect;