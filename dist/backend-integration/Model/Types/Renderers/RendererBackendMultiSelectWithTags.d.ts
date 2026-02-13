import React from "react";
import { ModelFieldName, ModelIdFilterData, PageVisibility } from "../../Model";
import ModelRenderParams from "../../RenderParams";
import { BackendMultiSelectWithTagsProps } from "../../../../backend-components/Selector/BackendMultiSelectWithTags";
import { BaseSelectorData, MultiSelectorData } from "../../../../standalone";
import TypeIds from "../TypeIds";
type OmitProperties = "selected" | "onSelect" | "disabled" | "dataModel" | "initialData" | "title";
/**
 * Renders TypeEnum as drop-down selector (with search)
 */
declare class RendererBackendMultiSelectWithTags<GroupKeyT extends ModelFieldName, DataKeyT extends ModelFieldName, GroupVisibilityT extends PageVisibility, DataVisibilityT extends PageVisibility, GroupCustomT, DataCustomT, GroupDataT extends BaseSelectorData, DataDataT extends MultiSelectorData> extends TypeIds {
    idFilter?: ModelIdFilterData;
    private readonly props;
    constructor(props: Omit<BackendMultiSelectWithTagsProps<GroupKeyT, DataKeyT, GroupVisibilityT, DataVisibilityT, GroupCustomT, DataCustomT, GroupDataT, DataDataT>, OmitProperties>);
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererBackendMultiSelectWithTags;
