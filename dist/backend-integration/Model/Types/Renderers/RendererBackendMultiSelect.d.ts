import React from "react";
import { ModelIdFilterData, ModelUnknown } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import { MultiSelectorData } from "../../../../standalone";
import { FormBackendMultiSelectProps } from "../../../../backend-components/Selector/FormSelectors";
import TypeIds from "../TypeIds";
type OmitProperties = "selected" | "onSelect" | "disabled" | "model" | "initialData" | "autoFocus";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererBackendMultiSelect<M extends ModelUnknown> extends TypeIds {
    idFilter?: ModelIdFilterData;
    private readonly props;
    constructor(props: Omit<FormBackendMultiSelectProps<M, MultiSelectorData>, OmitProperties>);
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererBackendMultiSelect;
