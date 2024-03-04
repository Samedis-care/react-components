import React from "react";
import { ModelFieldName, PageVisibility } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import TypeStringArray from "../TypeStringArray";
import { BackendDataGridMultiSelectProps } from "../../../../backend-components/Selector/BackendDataGridMultiSelect";
type OmitProperties = "selected" | "onChange" | "readOnly" | "model";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererBackendDataGridMultiSelect<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> extends TypeStringArray {
    private readonly props?;
    constructor(props?: Omit<BackendDataGridMultiSelectProps<KeyT, VisibilityT, CustomT>, OmitProperties>);
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererBackendDataGridMultiSelect;
