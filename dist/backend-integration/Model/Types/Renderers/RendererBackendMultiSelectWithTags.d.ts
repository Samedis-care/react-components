import React from "react";
import { ModelIdFilterData, ModelUnknown } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import { BackendMultiSelectWithTagsProps } from "../../../../backend-components/Selector/BackendMultiSelectWithTags";
import { BaseSelectorData, MultiSelectorData } from "../../../../standalone";
import TypeIds from "../TypeIds";
type OmitProperties = "selected" | "onSelect" | "disabled" | "dataModel" | "initialData" | "title" | "autoFocus";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererBackendMultiSelectWithTags<GroupModelT extends ModelUnknown, DataModelT extends ModelUnknown, GroupDataT extends BaseSelectorData, DataDataT extends MultiSelectorData> extends TypeIds {
    idFilter?: ModelIdFilterData;
    private readonly props;
    constructor(props: Omit<BackendMultiSelectWithTagsProps<GroupModelT, DataModelT, GroupDataT, DataDataT>, OmitProperties>);
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererBackendMultiSelectWithTags;
