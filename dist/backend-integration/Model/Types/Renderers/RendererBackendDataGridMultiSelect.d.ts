import React from "react";
import { ModelUnknown } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import { BackendDataGridMultiSelectProps } from "../../../../backend-components/Selector/BackendDataGridMultiSelect";
import TypeIds from "../TypeIds";
type OmitProperties = "selected" | "onChange" | "readOnly" | "model";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererBackendDataGridMultiSelect<M extends ModelUnknown> extends TypeIds {
    private readonly props?;
    constructor(props?: Omit<BackendDataGridMultiSelectProps<M>, OmitProperties>);
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererBackendDataGridMultiSelect;
