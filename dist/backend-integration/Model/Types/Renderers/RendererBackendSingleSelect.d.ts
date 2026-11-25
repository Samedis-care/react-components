import React from "react";
import { ModelIdFilterData, ModelUnknown } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import TypeId from "../TypeId";
import { BackendSingleSelectProps } from "../../../../backend-components/Selector/BackendSingleSelect";
import { FormBackendSingleSelectProps } from "../../../../backend-components/Selector/FormSelectors";
import { DistributiveOmit } from "../../../../utils/internal/distributiveOmit";
type OmitProperties = "selected" | "onSelect" | "disabled" | "model" | "initialData" | "autoFocus";
export type RendererBackendSingleSelectProps<M extends ModelUnknown> = DistributiveOmit<FormBackendSingleSelectProps<M>, OmitProperties | "modelFetch"> & {
    modelFetch?: BackendSingleSelectProps<M>["modelFetch"] | ((data: Record<string, unknown>) => BackendSingleSelectProps<M>["modelFetch"]);
};
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererBackendSingleSelect<M extends ModelUnknown> extends TypeId {
    idFilter?: ModelIdFilterData;
    private readonly props;
    constructor(props: RendererBackendSingleSelectProps<M>);
    render(params: ModelRenderParams<string | null>): React.ReactElement;
}
export default RendererBackendSingleSelect;
