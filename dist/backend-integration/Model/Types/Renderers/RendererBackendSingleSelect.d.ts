import React from "react";
import { ModelFieldName, ModelIdFilterData, PageVisibility } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import TypeId from "../TypeId";
import { BackendSingleSelectProps } from "../../../../backend-components/Selector/BackendSingleSelect";
import { FormBackendSingleSelectProps } from "../../../../backend-components/Selector/FormSelectors";
type OmitProperties = "selected" | "onSelect" | "disabled" | "model" | "initialData";
export type RendererBackendSingleSelectProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> = Omit<FormBackendSingleSelectProps<KeyT, VisibilityT, CustomT>, OmitProperties | "modelFetch"> & {
    modelFetch?: BackendSingleSelectProps<KeyT, VisibilityT, CustomT>["modelFetch"] | ((data: Record<string, unknown>) => BackendSingleSelectProps<KeyT, VisibilityT, CustomT>["modelFetch"]);
};
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererBackendSingleSelect<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends TypeId {
    idFilter?: ModelIdFilterData;
    private readonly props;
    constructor(props: RendererBackendSingleSelectProps<KeyT, VisibilityT, CustomT>);
    render(params: ModelRenderParams<string | null>): React.ReactElement;
}
export default RendererBackendSingleSelect;
