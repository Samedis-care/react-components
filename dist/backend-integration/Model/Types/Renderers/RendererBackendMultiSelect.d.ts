import React from "react";
import { ModelFieldName, ModelRenderParams, PageVisibility } from "../../index";
import TypeStringArray from "../TypeStringArray";
import { BackendMultiSelectProps } from "../../../../backend-components/Selector/BackendMultiSelect";
import { MultiSelectorData } from "../../../../standalone";
declare type OmitProperties = "selected" | "onSelect" | "disabled" | "model" | "initialData";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererBackendMultiSelect<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends TypeStringArray {
    private readonly props;
    constructor(props: Omit<BackendMultiSelectProps<KeyT, VisibilityT, CustomT, MultiSelectorData>, OmitProperties>);
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererBackendMultiSelect;
