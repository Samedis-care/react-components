import React from "react";
import { ModelFieldName, PageVisibility } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import TypeStringArray from "../TypeStringArray";
import { MultiSelectorData } from "../../../../standalone";
import { FormBackendMultiSelectProps } from "../../../../backend-components/Selector/FormSelectors";
type OmitProperties = "selected" | "onSelect" | "disabled" | "model" | "initialData";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererBackendMultiSelect<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends TypeStringArray {
    private readonly props;
    constructor(props: Omit<FormBackendMultiSelectProps<KeyT, VisibilityT, CustomT, MultiSelectorData>, OmitProperties>);
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererBackendMultiSelect;
