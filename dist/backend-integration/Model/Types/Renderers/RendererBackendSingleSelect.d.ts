import React from "react";
import { ModelIdFilterData, ModelUnknown } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import TypeId from "../TypeId";
import { BackendSingleSelectProps } from "../../../../backend-components/Selector/BackendSingleSelect";
import { FormBackendSingleSelectProps } from "../../../../backend-components/Selector/FormSelectors";
import { DistributiveOmit } from "../../../../utils/distributiveOmit";
type OmitProperties = "selected" | "onSelect" | "disabled" | "model" | "initialData" | "autoFocus";
/**
 * The params of ModelDataTypeBackendSingleSelectRenderer: the props of the
 * FormBackendSingleSelect it renders while the field is editable, except those
 * it takes from the field (selected, onSelect, disabled, model, initialData,
 * autoFocus). It also sets dirty, error, warning and autocompleteId from the
 * field, and puts the relation model's query key in front of refreshToken.
 * @typeParam M The field's relation model (its getRelationModel)
 */
export type RendererBackendSingleSelectProps<M extends ModelUnknown> = DistributiveOmit<FormBackendSingleSelectProps<M>, OmitProperties | "modelFetch"> & {
    /**
     * The model the select fetches records through, e.g. to batch requests
     * (BackendSingleSelect's modelFetch); the relation model if omitted. Or a
     * function that returns it from the record's values, called on every
     * render of the field, like the model field's getRelationModel
     */
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
