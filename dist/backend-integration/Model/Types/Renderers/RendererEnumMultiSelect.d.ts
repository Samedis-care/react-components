import React from "react";
import ModelRenderParams from "../../RenderParams";
import TypeEnumMulti, { AdvancedMultiEnumValue } from "../TypeEnumMulti";
import { MultiSelectorData, MultiSelectProps } from "../../../../standalone";
import { DistributiveOmit } from "../../../../utils/internal/distributiveOmit";
export type RendererEnumMultiSelectProps = DistributiveOmit<MultiSelectProps<MultiSelectorData>, "label" | "selected" | "onLoad" | "onSelect" | "disabled" | "autoFocus">;
/**
 * Renders TypeEnumMulti as selector
 */
declare class RendererEnumMultiSelect<T extends string = string> extends TypeEnumMulti<T> {
    props?: RendererEnumMultiSelectProps;
    constructor(values: AdvancedMultiEnumValue<T>[], props?: RendererEnumMultiSelectProps);
    render(params: ModelRenderParams<T[]>): React.ReactElement;
}
export default RendererEnumMultiSelect;
