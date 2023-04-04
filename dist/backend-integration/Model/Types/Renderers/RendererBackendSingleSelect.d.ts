import React from "react";
import { ModelFieldName, ModelRenderParams, PageVisibility } from "../../index";
import TypeId from "../TypeId";
import { BackendSingleSelectProps } from "../../../../backend-components/Selector/BackendSingleSelect";
declare type OmitProperties = "selected" | "onSelect" | "disabled" | "model" | "initialData";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererBackendSingleSelect<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends TypeId {
    private readonly props;
    constructor(props: Omit<BackendSingleSelectProps<KeyT, VisibilityT, CustomT>, OmitProperties>);
    render(params: ModelRenderParams<string | null>): React.ReactElement;
}
export default RendererBackendSingleSelect;
